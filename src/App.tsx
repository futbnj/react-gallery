import React, {useEffect, useState} from 'react';
import Loader from './components/Loader/Loader';
import Gallery from "./components/Gallery/Gallery";

export type DataProps = {
    url: string,
    width: number,
    height: number
}

const App = (): JSX.Element => {
    // Ссылка на svg анимацию для предварительного загрузчика изображений
    const preloader =  require("./images/preloader.svg");

    // Собираем отправленные пользователем ссылки и файлы с изображениями из компонента загрузки
    // для рендера их в компонент галереи
    const [data, setData] = useState<DataProps[]>([]);

    // Отслеживам изменения ширины экрана для адаптивности компонента галереи
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
    })

    return (
        <main>
            <Loader setData={setData} />
            <Gallery data={data} windowWidth={windowWidth} preloader={preloader}/>
        </main>
    );
}

export default App; 