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
  const canvas2Ref = useRef<HTMLCanvasElement>(null)

  const run = async (uNet, ctx: CanvasRenderingContext2D, video) => {
    const result = await uNet.segment(video)
    // console.log(result)
    const arr = Array.from(result.raw.backgroundMask)

    const imgData = ctx.createImageData(384, 384)
    const { data } = imgData

    console.log(data, arr, result)
    for(let i = 0; i < arr.length; i += 1) {
      // if(arr[i]){
      //   data[i] = arr[i]
      // }

      const j = i * 3
      // if(arr[i] === 0 || arr[i] === 1){
        data[j] = arr[i]
        data[j+1] = arr[i]
        data[j+2] = arr[i]
        // data[j+3] = 255
      // }
    }
    ctx.putImageData(imgData, 0, 0)

    run(uNet, ctx, video)
  }

  const setup = async (video) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.srcObject = stream;
    video.onloadedmetadata = function() {
      // setWidth(video.videoWidth / 2)
      // setHeight(video.videoHeight / 2)
    };

    const uNet = ml5.uNet('face');

    return uNet
  }

  const loadBackground = (ctx) => {
    const image = new Image();
    image.src = 'paradise.jpg';
    image.onload = function(){
      ctx.drawImage(image, 0, 0);
    }
  }

  useEffect(() => { 
    if(!videoRef.current || !canvasRef.current || !canvas2Ref.current){ 
      return
    }

    const resultContext = canvas2Ref.current.getContext("2d")
    // loadBackground(resultContext)

    const ctx = canvasRef.current.getContext("2d")
    if(!ctx) {
      throw new Error("no context :(")
    }

    setup(videoRef.current).then(uNet => run(uNet, resultContext, videoRef.current))
  }, []);

  return (
    <div>
      <div className="video-wrapper">
        <video className="video" width={width} height={height} autoPlay={true} ref={videoRef} />
        <canvas width={width} height={height} className="canvas" ref={canvasRef} />
      </div>
      <div className="video-wrapper">
        <img src="paradise.jpg" width={width} height={width} style={{ position: "absolute" }} />
        <canvas width={width} height={width} className="canvas" ref={canvas2Ref} />
      </div>
    </div>
  );
}

export default App;
