import React from "react";
import {GalleryProps} from "./Gallery.props";
import ImageCard from "./ImageCard/ImageCard";

const Gallery = ({data, windowWidth, preloader}: GalleryProps): JSX.Element   => {

    return (
        <section className="gallery">
            {
                data?.map((element, index): JSX.Element => {
                    return (
                        <ImageCard
                            url={element.url}
                            width={element.width}
                            height={element.height}
                            windowWidth={windowWidth}
                            preloader={preloader}
                            key={index}
                        />
                    )
                })
            }
        </section>

    )
}

export default Gallery;
