import React from "react";
import {DataProps} from "../../App";

export interface LoaderProps {
    setData: React.Dispatch<React.SetStateAction<DataProps[]>>;
}