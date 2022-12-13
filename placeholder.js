/* Contains Old Codes that may be useful */
const handleCanvasClick = (e) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const xPos = e.clientX - canvas.getBoundingClientRect().x;
  const yPos = e.clientY - canvas.getBoundingClientRect().y;
  const currentHeight =
    canvas.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top;
  const currentWidth =
    canvas.getBoundingClientRect().right - canvas.getBoundingClientRect().left;
  const hRatio = canvas.height / currentHeight;
  const wRatio = canvas.width / currentWidth;
  const scaledX = xPos * wRatio;
  const scaledY = yPos * hRatio;
  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.fillRect(scaledX - 25, scaledY - 25, 50, 50);
  setMaskingPoints([...maskingPoints, [xPos * wRatio, yPos * hRatio]]);
};

const undoMask = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const im = new Image();
  im.src = image;

  im.onload = () => {
    canvas.width = im.width;
    canvas.height = im.height;

    ctx.drawImage(im, 0, 0);
  };

  ctx.fillStyle = "rgb(255, 0, 0)";
  for (let i = 0; i < maskingPoints.length - 1; i++)
    ctx.fillRect(maskingPoints[i][0] - 25, maskingPoints[i][1] - 25, 50, 50);

  setMaskingPoints(maskingPoints.slice(0, maskingPoints.length - 1));
};

const clearMasks = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const im = new Image();
  im.src = image;

  im.onload = () => {
    canvas.width = im.width;
    canvas.height = im.height;

    ctx.drawImage(im, 0, 0);
  };
  setMaskingPoints([]);
};

const drawPoly = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  ctx.moveTo(maskingPoints[0][0], maskingPoints[0][1]);
  for (let i = 1; i < maskingPoints.length; i++)
    ctx.lineTo(maskingPoints[i][0], maskingPoints[i][1]);
  ctx.closePath();
  ctx.fill();
};
