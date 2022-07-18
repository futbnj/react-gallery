import React, {useState} from 'react';
import {DataProps} from "../../App";
import {LoaderProps} from "./Loader.props";

type ImageProps = {
    width: number,
    height: number
}

// Принимаем метод setData, чтобы сохранять загружаемые изображения в одно состояние
const Loader = ({setData} : LoaderProps) : JSX.Element => {

    // Отслеживаем состояние ввода ссылок из поля ввода
    const [value, setValue] = useState<string>('');
    // Отслеживаем состояние перетасскивания файлов из локального хранилища для изменения сообщения на плейсхолдере
    const [drag, setDrag] = useState<boolean>(false);
    // Записываем сообщение ошибки, если введены невалидная ссылка или файл неверного формата
    const [error, setError] = useState<string>('');

    // Изменяем состояние value когда пользователь вводит ссылку
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        const inputTarget = event.target as HTMLInputElement;
        setValue(inputTarget?.value);
    }

    // Обрабатываем введенные данные при отправке
    const handleSubmit = async () : Promise<Promise<() => void> | Promise<void>> => {
        // Если поле пустое, прекращаем выполенение функции, обнуляем сообщение об ошибке
        if (value.length === 0) {
            setError('');
            return;
        }

        // Обнуляем сообщение об ошибке перед новой звгрузкой
        setError('');

        // Проверяем является ли ссылка ссылкой на json файл
        if (isJSONUrl(value)) {
            // Получаем данные из файла
            const response = await fetch(value);
            const json = await response.json();
            // Добавляем изображения в общий массив с изображениями
            setData((prevData: DataProps[]): DataProps[] => {
                return (typeof prevData !== 'undefined') ? prevData.concat(json['galleryImages']) : json['galleryImages'];
            })
        } else {
            // Получаем promise с загрузившимся изображением, если изображение было успешно обработано, добавляем в
            // в массив с изображениями, если нет - возращаем сообщение об ошибке
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
        }
    }

    // Обнуляем массив с изображениями, очищаем поле ввода и убираем сообщение об ошибке при нажатии на
    // кнопку Clear
    const clearData = (): void => {
        setData([]);
        setValue('');
        setError('');
    }

    // Если пользователь перетаскивает файл в поле загрузки, обновляем drag state на true, что меняет
    // текст плейсхолдера
    const handleDragStart = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        setDrag(true);
    }

    // При оттаскивании файла из поля загрузкиа, обновляем drag state на false, что меняет текст плейсхолдера на
    // дефолтное сообщение
    const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        setDrag(false);
    }

    // Обрабатываем загрузку файла
    const handleDrop = async (e: React.DragEvent<HTMLInputElement>) => {
        // Предотвращаем открытие файла в новом окне браузера
        e.preventDefault();

        // Обнуляем состояние drag и error
        setDrag(false);
        setError('');

        // Получаем объект с загруженными файлами и перебираем его
        const files = [...e.dataTransfer.files];
        files.forEach(file => {
            if (file.type === "image/jpeg" || file.type === "image/png") {
                // Читаем файл изображения
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = e => {
                    if ( typeof e.target?.result !== 'undefined') {
                        // В случае успеха, добавляем изображение в состояние data, в случае ошибки устанавливаем
                        // сообщение ошибки
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
                // Читаем файл
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = e => {
                    if ( typeof e.target?.result !== 'undefined') {
                        // Парсим текст файла в js объект
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

    // Создаем promise для проверки изображений, в случае успеха возвращаем высоту и ширину изображения
    const handleImageProcess = (src: string): Promise<ImageProps> => {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => resolve({height: img.naturalHeight, width: img.naturalWidth} as ImageProps)
            img.onerror = reject
            img.src = src
        })
    }

    // Функиця-helper для проверки url на json
    const isJSONUrl = (url: string): boolean => {
        return /\.(json)$/.test(url);
    }

    // По клику на enter вызываем обработчик отправки ссылки
    const handleSubmitByEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <>
            <section className="loader">
                <div className="loader__input">
                    <input
                        className="loader__input_input"
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
                    <span className="loader__input_error">
                        {
                            error !== '' ? error : ''
                        }
                    </span>
                </div>
                <button className="loader__button" onClick={handleSubmit}>Submit</button>
                <button className="loader__button" onClick={clearData}>Clear</button>
            </section>
        </>
    )
}

export default Loader;