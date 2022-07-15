import React, {useRef} from "react";
import {ImageProps} from "./image.props";

const ImageComponent = ({url, width, height, windowWidth, preloader}: ImageProps): JSX.Element => {

    const imageRef = useRef<HTMLImageElement>(null);

    let coefficient = 0.025;
    if (windowWidth < 580) {
        coefficient = 0.065;
    }

    let flexValue = windowWidth*coefficient;
    if (windowWidth > 880) {
        flexValue = 17;
    }

    const handlePreload = () => {
        const timeout = setTimeout(()=> {
            if (imageRef.current !== null) {
                imageRef.current.src = url;
            }
         }, 300)

        return () => clearTimeout(timeout);
    }

    const style = {
        flex: (width >= height)
              ? `1 1 ${flexValue > 35 ? 35 : flexValue}%`
              : `1 1 ${flexValue/2 > 25 ? 25 : flexValue/2}%`,
    };

    return (
        <div className="gallery__item" style={style} >
            <img className="gallery__img" ref={imageRef} src={preloader} onLoad={handlePreload}  alt={url}/>
        </div>
    )
}

export default ImageComponent;
