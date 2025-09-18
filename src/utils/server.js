import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';

const PORT = process.env.WS_PORT || process.env.PORT || 1234;
const MAX_PARTICIPANTS = parseInt(process.env.MAX_PARTICIPANTS || '4');
const rooms = new Map(); // Map<roomId, { doc: Y.Doc, awareness: awarenessProtocol.Awareness, connections: Set<WebSocket> }>

// Message types (matching y-websocket protocol)
const messageSync = 0;
const messageAwareness = 1;

const wss = new WebSocketServer({ 
  port: PORT,
  perMessageDeflate: {
    zlibDeflateOptions: {
      threshold: 1024
    }
  }
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);

// Handle incoming Y.js protocol messages
function handleMessage(ws, roomId, message) {
  try {
    const room = rooms.get(roomId);
    if (!room) return;

    const decoder = decoding.createDecoder(new Uint8Array(message));
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync:
        console.log(`Sync message in room ${roomId}`);
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);
        
        // Broadcast sync message to other connections in the room
        if (encoding.length(encoder) > 1) {
          const response = encoding.toUint8Array(encoder);
          room.connections.forEach(conn => {
            if (conn !== ws && conn.readyState === conn.OPEN) {
              conn.send(response);
            }
          });
        }
        break;
        
      case messageAwareness:
        console.log(`Awareness message in room ${roomId}`);
        const awarenessUpdate = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(room.awareness, awarenessUpdate, ws);
        
        // Broadcast awareness to other connections
        room.connections.forEach(conn => {
          if (conn !== ws && conn.readyState === conn.OPEN) {
            const awarenessEncoder = encoding.createEncoder();
            encoding.writeVarUint(awarenessEncoder, messageAwareness);
            encoding.writeVarUint8Array(awarenessEncoder, awarenessUpdate);
            conn.send(encoding.toUint8Array(awarenessEncoder));
          }
        });
        break;
        
      default:
        console.log(`Unknown message type: ${messageType}`);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

wss.on('connection', (ws, req) => {
  console.log('New connection attempt');
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  let roomId = url.searchParams.get('room');
    if (!roomId) {
    const pathParts = url.pathname.split('/').filter(Boolean);
    roomId = pathParts[0] || 'default-room';
  }
  
  console.log(`Connection attempt for room: ${roomId}`);
  
  if (!rooms.has(roomId)) {
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    rooms.set(roomId, {
      doc,
      awareness,
      connections: new Set()
    });
    console.log(`Created new room: ${roomId}`);
  }
  
  const room = rooms.get(roomId);
  
  // Check participant limit
  if (room.connections.size >= MAX_PARTICIPANTS) {
    console.log(`Room ${roomId} is full (${room.connections.size}/${MAX_PARTICIPANTS}), rejecting connection`);
    
    ws.send(JSON.stringify({ 
      type: 'room_full', 
      message: 'Room has reached maximum capacity',
      maxParticipants: MAX_PARTICIPANTS 
    }));
    
    setTimeout(() => {
      ws.close(1000, 'Room is full');
    }, 100);
    
    return;
  }
  
  // Add connection to room
  room.connections.add(ws);
  console.log(`Client joined room ${roomId} (${room.connections.size}/${MAX_PARTICIPANTS} participants)`);
  
  // Send initial sync message
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  ws.send(encoding.toUint8Array(encoder));
  
  // Send current awareness state
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(awarenessStates.keys()))
    );
    ws.send(encoding.toUint8Array(awarenessEncoder));
  }
  
  ws.on('message', (message) => {
    handleMessage(ws, roomId, message);
  });
  
  ws.on('close', () => {
    room.connections.delete(ws);
    console.log(`Client left room ${roomId} (${room.connections.size}/${MAX_PARTICIPANTS} participants)`);

    // Cleaning
    if (room.connections.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    room.connections.delete(ws);
  });
});
