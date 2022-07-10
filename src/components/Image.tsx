import React, {useRef} from "react";
import {ImageProps} from "./image.props";

const ImageComponent = ({url, width, height, windowWidth, preloader}: ImageProps): JSX.Element => {

    const imageRef = useRef<HTMLImageElement>(null);

    let coefficient = 0.015;
    if (windowWidth < 580) {
        coefficient = 0.065;
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
              ? `1 1 ${windowWidth*coefficient > 35 ? 35 : windowWidth*coefficient}%`
              : `1 1 ${windowWidth*coefficient/2 > 25 ? 25 : windowWidth*coefficient/2}%`,
    };

    return (
        <div className="gallery__item" style={style} >
            <img className="gallery__img" ref={imageRef} src={preloader} onLoad={handlePreload}  alt={url}/>
        </div>
    )
}

export default ImageComponent;
