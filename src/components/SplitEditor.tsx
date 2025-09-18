import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { yCollab } from "y-codemirror.next";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { Box, Text, Textarea, VStack } from "@chakra-ui/react";
import Canvas from "./Canvas";
import LimitingScreen from "./LimitingScreen";

// Language boilerplates
const BOILERPLATES = {
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  python: `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
};

const SplitEditor: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Editor refs
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Yjs and WebSocket
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  // State
  const [language, setLanguage] = useState<string>("java");
  const [splitWidth, setSplitWidth] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [testInput, setTestInput] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting");
  const [roomFull, setRoomFull] = useState<boolean>(false);
  const [participantCount, setParticipantCount] = useState<number>(1);

  // Handle split 
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const containerWidth = window.innerWidth - 32;
      const newWidth = Math.max(
        20,
        Math.min(80, (e.clientX / containerWidth) * 100)
      );
      setSplitWidth(newWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Yjs collaboration
  useEffect(() => {
    if (!roomId || roomFull) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    try {
      // Use environment variable for WebSocket URL in production
      const wsUrl = import.meta.env.VITE_WS_URL || 
        (import.meta.env.PROD
          ? `wss://${window.location.hostname}/ws`
          : `ws://localhost:1234`);

      const provider = new WebsocketProvider(wsUrl, roomId, ydoc);
      providerRef.current = provider;

      provider.on("status", ({ status }: { status: string }) => {
        setConnectionStatus(status);
      });

      const userId = Math.random().toString(36).substr(2, 9);
      provider.awareness.setLocalStateField("user", {
        name: `User ${userId.slice(-4)}`,
        id: userId,
      });

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values());
        const active = states.filter((s) => s && s.user).length;
        setParticipantCount(Math.max(1, active));
      });

      const ytext = ydoc.getText("codemirror");

      if (ytext.toString().trim() === "") {
        const boiler =
          BOILERPLATES[language as keyof typeof BOILERPLATES] ||
          BOILERPLATES.java;
        ytext.insert(0, boiler);
      }

      const getLang = () => {
        switch (language) {
          case "java":
            return java();
          case "python":
            return python();
          case "cpp":
            return cpp();
          default:
            return java();
        }
      };

      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [basicSetup, yCollab(ytext, provider.awareness), getLang()],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current!,
      });
      viewRef.current = view;
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }

    return () => {
      if (viewRef.current) viewRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [roomId, language, roomFull]);

  const handleRunCode = async (withInput: boolean = false) => {
    if (!viewRef.current) return;
    setIsRunning(true);
    setOutput("Executing...");

    const code = viewRef.current.state.doc.toString();
    const input = withInput ? testInput : "";

    // Use backend API instead of directly calling Judge0
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${backendUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          input
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }

      const result = await response.json();
      
      let output = result.output;
      
      // Add execution details if available
      if (result.executionTime || result.memory) {
        const details = [];
        if (result.executionTime) details.push(`Time: ${result.executionTime}`);
        if (result.memory) details.push(`Memory: ${result.memory}`);
        output += `\n\n--- Execution Details ---\n${details.join(' | ')}`;
      }

      // Add input if provided
      if (withInput && input) {
        output = `Input:\n${input}\n\nOutput:\n${output}`;
      }

      setOutput(output);
      setIsRunning(false);

    } catch (error) {
      console.error("Code execution error:", error);
      let errorMessage = "Unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Handle common backend connection errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = "Backend server is not running. Please start the backend server on port 5000.";
      }
      
      setOutput(`Error: ${errorMessage}`);
      setIsRunning(false);
    }
  };

  const handleLeaveRoom = () => {
    try {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    } catch (e) {
      console.warn('Error while leaving room:', e);
    }
    navigate('/');
  };

  if (roomFull) {
    return (
      <LimitingScreen
        roomId={roomId}
        onRetry={() => {
          setRoomFull(false);
        }}
      />
    );
  }

  return (
    <Box minH="100vh" bg="#F7F6EF" p={4}>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold">
          Room: {roomId} ({connectionStatus})
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text fontSize="sm">Participants: {participantCount}/4</Text>
          <button
            onClick={handleLeaveRoom}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Leave Room
          </button>
        </div>
      </Box>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: 200 }}>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
        <button disabled={isRunning} onClick={() => handleRunCode(false)} style={{ padding: '6px 12px' }}>
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <button disabled={isRunning} onClick={() => handleRunCode(true)} style={{ padding: '6px 12px' }}>
          {isRunning ? 'Running...' : 'Run with Input'}
        </button>
      </div>

      {/* Split View */}
      <Box display="flex" h="calc(100vh - 200px)" position="relative">
        {/* Code Editor */}
        <Box w={`${splitWidth}%`} pr={2} display="flex" flexDirection="column">
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Code Editor
          </Text>
          <Box
            ref={editorRef}
            border="1px solid #ccc"
            borderRadius="md"
            flex="1"
            bg="white"
            overflow="hidden"
          />
          <VStack mt={2} align="stretch">
            <Textarea
              placeholder="Enter custom input here..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              size="sm"
              bg="gray.50"
            />
            {output && (
              <Box
                p={2}
                bg="black"
                color="green.400"
                fontFamily="mono"
                fontSize="sm"
                borderRadius="md"
                minH="80px"
              >
                <Text fontSize="xs" color="gray.400" mb={1}>
                  Output:
                </Text>
                <Text whiteSpace="pre-line">{output}</Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Resizer */}
        <Box
          w="4px"
          bg="gray.300"
          cursor="col-resize"
          onMouseDown={handleMouseDown}
        />

        <Canvas ydoc={ydocRef.current} width={splitWidth} />
      </Box>
    </Box>
  );
};

export default SplitEditor;
