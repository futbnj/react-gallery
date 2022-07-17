import React, {useEffect, useState} from 'react';
import ImageComponent from "./Image";

type DataProps = {
    url: string,
    width: number,
    height: number
}

type ImageProps = {
    width: number,
    height: number
}

const Loader = (): JSX.Element => {
    const preloader =  require("../images/preloader.svg");

    const [value, setValue] = useState<string>('');
    const [data, setData] = useState<{url: string, width: number, height: number}[]>();
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [drag, setDrag] = useState(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        const inputTarget = event.target as HTMLInputElement;
        setValue(inputTarget?.value);
    }

    const handleSubmit = async () : Promise<Promise<() => void> | Promise<void>> => {
        if (value.length === 0) return;
        if (value.substring(value.lastIndexOf('.') + 1) !== 'json') {
            let dataObject: DataProps[] = [{url: '', width: 0, height: 0}];
            const img = new Image();
            img.src = value;
            img.onload = function() {
                dataObject[0].width = img.naturalWidth;
                dataObject[0].height = img.naturalHeight;
                dataObject[0].url = value;
                setData((prevData): DataProps[] | undefined => {
                        return (typeof prevData !== 'undefined') ? prevData.concat(dataObject) : dataObject;
                })
            };
        } else {
            const response = await fetch(value);
            const json = await response.json();
            setData((prevData): DataProps[] | undefined => {
                return (typeof prevData !== 'undefined') ? prevData.concat(json['galleryImages']) : json['galleryImages'];
            })
        }
    }

    const clearData = (): void => {
        setData([]);
        setValue('');
    }

    const handleDragStart = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        setDrag(true);
    }

    const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        setDrag(false);
    }

    const handleDrop = async (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();

        setDrag(false);

        const files = [...e.dataTransfer.files];
        files.forEach(file => {
            if (file.type === "image/jpeg") {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = e => {
                    if ( typeof e.target?.result !== 'undefined') {
                        handleImageProcess(e.target?.result  as string).then((img: ImageProps) : void | PromiseLike<void> => {
                            let dataObject: DataProps[] = [{url: '', width: 0, height: 0}];
                            dataObject[0].width = img.width;
                            dataObject[0].height = img.height;
                            dataObject[0].url = e.target?.result  as string;
                            setData((prevData): DataProps[] | undefined => {
                                return (typeof prevData !== 'undefined') ? prevData?.concat(dataObject) : dataObject;
                            })
                        })
                    }
                };
            }
            if (file.type === "application/json") {
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = e => {
                    if ( typeof e.target?.result !== 'undefined') {
                        const fileContents = JSON.parse(e.target?.result as string)
                        setData((prevData): DataProps[] | undefined => {
                            return (typeof prevData) !== 'undefined' ? prevData?.concat(fileContents['galleryImages']) : fileContents['galleryImages'];
                        })
                    }
                };
            }
        })
    }

    const handleImageProcess = (src: string): Promise<ImageProps> => {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => resolve({height: img.naturalHeight, width: img.naturalWidth} as ImageProps)
            img.onerror = reject
            img.src = src
        })
    }

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
    })


    return (
        <>
            <div className="loader">
                <input
                    className="loader__input"
                    type="url"
                    value={value}
                    onChange={handleInput}
                    onSubmit={handleSubmit}
                    onDrop={(e) => handleDrop(e)}
                    onDragStart={(e) => handleDragStart(e)}
                    onDragOver={(e) => handleDragStart(e)}
                    onDragLeave={(e) => handleDragLeave(e)}
                    placeholder={drag ? 'Отпустите файл чтобы загрузить изображения' : 'Перетащите файл или вставьте ссылку'}
                />
                <button className="loader__button" onClick={handleSubmit}>Submit</button>
                <button className="loader__button" onClick={clearData}>Clear</button>
            </div>
            <div className="gallery">
                {
                    data?.map((element, index) => {
                        return (
                            <ImageComponent width={element.width} height={element.height} url={element.url} key={index} windowWidth={windowWidth} preloader={preloader}/>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Loader;