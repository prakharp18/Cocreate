import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, Text, ButtonGroup, Button } from "@chakra-ui/react";
import { Stage, Layer, Line } from "react-konva";
import * as Y from "yjs";
import Konva from "konva";
import { Pen as PenIcon, Eraser as EraserIcon, Trash2 as TrashIcon } from "lucide-react";

interface CanvasProps {
  ydoc: Y.Doc | null;
  width: number;
}

interface DrawingLine {
  id: string;
  tool: string;
  points: number[];
  color: string;
  strokeWidth: number;
}

const Canvas: React.FC<CanvasProps> = ({ ydoc, width }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [yArray, setYArray] = useState<Y.Array<DrawingLine> | null>(null);

  useEffect(() => {
    if (!ydoc) return;

    const drawingArray = ydoc.getArray<DrawingLine>('canvas-drawings');

    setYArray(drawingArray);

    const handleYArrayChange = () => {
      setLines([...drawingArray.toArray()]);
    };

    drawingArray.observe(handleYArrayChange);
    
    setLines([...drawingArray.toArray()]);

    return () => {
      drawingArray.unobserve(handleYArrayChange);
    };
  }, [ydoc]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!yArray) return;
    
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      const newLine: DrawingLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        tool,
        points: [pos.x, pos.y],
        color: tool === 'pen' ? '#2563eb' : '#ffffff',
        strokeWidth: tool === 'pen' ? 3 : 12,
      };
      
      yArray.push([newLine]);
    }
  }, [tool, yArray]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current || !yArray) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (point) {
      const lastLine = yArray.get(yArray.length - 1);
      if (lastLine) {
        const newPoints = lastLine.points.concat([point.x, point.y]);
        yArray.delete(yArray.length - 1, 1);
        yArray.push([{ ...lastLine, points: newPoints }]);
      }
    }
  }, [yArray]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const handleTouchStart = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    handleMouseDown(e);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const clearCanvas = useCallback(() => {
    if (yArray) {
      yArray.delete(0, yArray.length);
    }
  }, [yArray]);

  return (
    <Box 
      w={`${100 - width}%`} 
      pl={2}
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Text fontSize="sm" fontWeight="medium" mb={2}>Collaborative Canvas</Text>
      
      {/* Floating toolbar */}
      <Box
        position="absolute"
        top="50px"
        right="20px"
        zIndex={10}
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.200"
        p={2}
      >
        <ButtonGroup size="sm" variant="ghost" orientation="vertical">
          <Button 
            onClick={() => setTool('pen')}
            colorScheme={tool === 'pen' ? 'blue' : 'gray'}
            bg={tool === 'pen' ? 'blue.100' : 'transparent'}
            borderRadius="lg"
            minW="auto"
            p={2}
            _hover={{ bg: tool === 'pen' ? 'blue.200' : 'gray.100' }}
            aria-label="pen tool"
          >
            <PenIcon size={16} />
          </Button>
          <Button 
            onClick={() => setTool('eraser')}
            colorScheme={tool === 'eraser' ? 'orange' : 'gray'}
            bg={tool === 'eraser' ? 'orange.100' : 'transparent'}
            borderRadius="lg"
            minW="auto"
            p={2}
            _hover={{ bg: tool === 'eraser' ? 'orange.200' : 'gray.100' }}
            aria-label="eraser tool"
          >
            <EraserIcon size={16} />
          </Button>
          <Button 
            onClick={clearCanvas} 
            colorScheme="red"
            variant="ghost"
            borderRadius="lg"
            minW="auto"
            p={2}
            _hover={{ bg: 'red.100' }}
            aria-label="clear canvas"
          >
            <TrashIcon size={16} />
          </Button>
        </ButtonGroup>
      </Box>

      <Box
        border="1px solid #ccc"
        borderRadius="md"
        bg="white"
        overflow="hidden"
        cursor={tool === 'pen' ? 'crosshair' : 'grab'}
        height="calc(100vh - 120px)"
      >
        <Stage
          width={window.innerWidth * (100 - width) / 100 - 16}
          height={window.innerHeight - 120}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={stageRef}
        >
          <Layer>
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
};

export default Canvas;
