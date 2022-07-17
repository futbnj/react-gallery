import React, {useState} from 'react';
import {DataProps} from "../../App";
import {LoaderProps} from "./Loader.props";

type ImageProps = {
    width: number,
    height: number
}

const Loader = ({setData} : LoaderProps) : JSX.Element => {

    const [value, setValue] = useState<string>('');
    const [drag, setDrag] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        const inputTarget = event.target as HTMLInputElement;
        setValue(inputTarget?.value);
    }

    const handleSubmit = async () : Promise<Promise<() => void> | Promise<void>> => {
        if (value.length === 0) {
            setError('');
            return;
        };

        setError('');

        if (!isJSONUrl(value)) {
            handleImageProcess(value)
                .then((img: ImageProps) : void | PromiseLike<void> => {
                    let dataObject: DataProps[] = [{url: '', width: 0, height: 0}];
                    dataObject[0].width = img.width;
                    dataObject[0].height = img.height;
                    dataObject[0].url = value;
                    setData((prevData: DataProps[]): DataProps[] => {
                        return (typeof prevData !== 'undefined') ? prevData?.concat(dataObject) : dataObject;
                    })
                })
                .catch(() => {
                    setError('Please enter a valid url string.');
                })
        } else {
            const response = await fetch(value);
            const json = await response.json();
            setData((prevData: DataProps[]): DataProps[] => {
                return (typeof prevData !== 'undefined') ? prevData.concat(json['galleryImages']) : json['galleryImages'];
            })
        }
    }

    const clearData = (): void => {
        setData([]);
        setValue('');
        setError('');
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
        setError('');

        const files = [...e.dataTransfer.files];
        files.forEach(file => {
            if (file.type === "image/jpeg" || file.type === "image/png") {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = e => {
                    if ( typeof e.target?.result !== 'undefined') {
                        handleImageProcess(e.target?.result  as string)
                            .then((img: ImageProps) : void | PromiseLike<void> => {
                                let dataObject: DataProps[] = [{url: '', width: 0, height: 0}];
                                dataObject[0].width = img.width;
                                dataObject[0].height = img.height;
                                dataObject[0].url = e.target?.result  as string;
                                setData((prevData: DataProps[]): DataProps[] => {
                                    return (typeof prevData !== 'undefined') ? prevData?.concat(dataObject) : dataObject;
                                })
                            })
                            .catch(() => {
                                setError('An error occurred when uploading a file.')
                            })
                    }
                };
            } else if (file.type === "application/json") {
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = e => {
                    if ( typeof e.target?.result !== 'undefined') {
                        const fileContents = JSON.parse(e.target?.result as string)
                        setData((prevData: DataProps[]): DataProps[] => {
                            return (typeof prevData) !== 'undefined' ? prevData?.concat(fileContents['galleryImages']) : fileContents['galleryImages'];
                        })
                    }
                };
            } else {
                setError('Files of such format are not supported. Supported file formats: *.json, *.jpg, *.jpeg, *.png.');
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

    const isJSONUrl = (url: string): boolean => {
        return /\.(json)$/.test(url);
    }




    const handleSubmitByEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <>
            <section className="sticky">
                <div className="loader">
                    <input
                        className="loader__input"
                        type="url"
                        value={value}
                        onChange={handleInput}
                        onSubmit={handleSubmit}
                        onKeyPress={(e) => handleSubmitByEnter(e)}
                        onDrop={(e) => handleDrop(e)}
                        onDragStart={(e) => handleDragStart(e)}
                        onDragOver={(e) => handleDragStart(e)}
                        onDragLeave={(e) => handleDragLeave(e)}
                        placeholder=
                            {
                                drag
                                    ? 'Drop file(s) to upload images'
                                    : 'Drag file(s) or insert a url to upload images. Supported file formats: *.json, *.jpg, *.jpeg, *.png.'
                            }
                    />
                    <button className="loader__button" onClick={handleSubmit}>Submit</button>
                    <button className="loader__button" onClick={clearData}>Clear</button>
                </div>
            </section>
            <div className="error">
                {
                    error !== '' ? error : ''
                }
            </div>
        </>
    )
}

export default Loader;