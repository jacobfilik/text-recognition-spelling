// Source - https://stackoverflow.com/a
// Posted by Linda Paiste, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-18, License - CC BY-SA 4.0

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const postAnalyse = async (input: string) => {
  const response = await axios.post<string>("/api/analyse", input);

  if (response.status != 200) {
    throw new Error("Failed to convert file to molecule");
  }

  return response.data;
};

const styles = {
  canvas: {
    backgroundColor: "white",
    // cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>✍️</text></svg>") 5 25,auto`,
  },
};

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [answer, setAnswer] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mutation = useMutation({
    mutationFn: postAnalyse,
    onSuccess: (data) => {
      console.log(data);
      setAnswer(data.result);
    },
    onError: () => {},
  });

  useEffect(
    () => {
      // define the resize function, which uses the re
      const resize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = 1024;
          canvas.height = 256;
        }
      };

      // call resize() once.
      resize();

      // attach event listeners.
      window.addEventListener("resize", resize);

      // remove listeners on unmount.
      return () => {
        window.removeEventListener("resize", resize);
      };
    },
    [] // no dependencies means that it will be called once on mount.
  );

  return (
    <Container>
      <Stack>
        <Typography variant={"h1"}>{answer}</Typography>
        <Box>
          <canvas
            style={styles.canvas}
            ref={canvasRef}
            onMouseDown={(e) => {
              // know that we are drawing, for future mouse movements.
              setIsDrawing(true);
              const context = e.currentTarget.getContext("2d");
              // begin path.
              if (context) {
                context.beginPath();
                context.lineWidth = 8;
                context.lineCap = "round";
                context.strokeStyle = "#2f2f30ff";
                context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
              }
            }}
            onMouseMove={(e) => {
              // only handle mouse moves when the mouse is already down.
              if (isDrawing) {
                const context = e.currentTarget.getContext("2d");
                if (context) {
                  context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  context.stroke();
                }
              }
            }}
            onMouseUp={(e) => {
              if (isDrawing) {
                const context = e.currentTarget.getContext("2d");
                if (context) {
                  context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  context.stroke();
                }
              }
              // end drawing.
              setIsDrawing(false);
            }}
          />
        </Box>
        <Button
          onClick={() => {
            console.log("hello");
            const img = new Image();
            img.src = canvasRef.current.toDataURL();
            console.log(img);
            mutation.mutate({ image: img.src });
          }}
        >
          PUSH ME
        </Button>
        <Button
          onClick={() => {
            const context = canvasRef.current.getContext("2d");
            context.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          }}
        >
          CLEAR
        </Button>
      </Stack>
    </Container>
  );
}

export default App;
