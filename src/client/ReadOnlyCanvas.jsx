import { Stage, Layer, Rect } from "react-konva";

const ReadOnlyCanvas = ({ rectangles }) => {
  return (
    <div id="canvas">
      <Stage
        width={480}
        height={320}
        style={{ border: "5px solid black", cursor: "not-allowed" }}
      >
        <Layer>
          {rectangles.map((rect, index) => (
            <Rect
              key={index}
              x={rect.position_x}
              y={rect.position_y}
              width={1}
              height={1}
              fill={rect.color}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default ReadOnlyCanvas;