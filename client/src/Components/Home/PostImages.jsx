import React from "react";
import { twMerge } from "tailwind-merge";

const PostImages = ({ images }) => {
  return (
    <div className={twMerge("grid gap-1", images.length > 1 && "grid-cols-2")}>
      {images.map((el, ind) => {
        if (ind === 0 && images.length === 3)
          return (
            <div
              key={ind}
              className="row-span-2"
              style={{
                backgroundImage: `url(${el})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          );
        return <img src={el} key={ind} alt="" />;
      })}
    </div>
  );
};

export default PostImages;
