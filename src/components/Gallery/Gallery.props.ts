import {DataProps} from "../../App";

export interface GalleryProps {
    data: DataProps[] | undefined;
    windowWidth: number;
    preloader: string;
}