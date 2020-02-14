/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef} from 'react';
import ml5 from "ml5"
import "./App.css"

const options = {
  multiplier: 0.75, // 1.0, 0.75, or 0.50, 0.25
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.6, // 0 - 1, defaults to 0.5
};

function App() {
  const [width, setWidth] = useState(600)
  const [height, setHeight] = useState(337.5)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const run = async (bodyPix, ctx: CanvasRenderingContext2D) => {
    const result = await bodyPix.segmentWithParts()
    const arr = Array.from(result.segmentation.data)

    const imgData = ctx.createImageData(result.segmentation.width, result.segmentation.height)
    const { data } = imgData

    for(let i = 0; i < arr.length; i += 1) {
      const j = i * 4
      if(arr[i] === 0 || arr[i] === 1){
        data[j] = 0
        data[j+1] = 0
        data[j+2] = 0
        data[j+3] = 255
      }
    }
    ctx.putImageData(imgData, 0, 0)

    run(bodyPix, ctx)
  }

  const setup = async (video) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.srcObject = stream;
    video.onloadedmetadata = function() {
      setWidth(video.videoWidth / 4)
      setHeight(video.videoHeight / 4)
   };
    
    return await ml5.bodyPix(video, options)
  }

  useEffect(() => { 
    if(!videoRef.current || !canvasRef.current){ 
      return
    }

    const ctx = canvasRef.current.getContext("2d")
    if(!ctx) {
      throw new Error("no context :(")
    }

    setup(videoRef.current).then(bodyPix => run(bodyPix, ctx))
  }, []);

  return (
    <div>
      <div className="video-wrapper">
        <video className="video" width={width} height={height} autoPlay={true} ref={videoRef} />
        <canvas width={width} height={height} className="canvas" ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
