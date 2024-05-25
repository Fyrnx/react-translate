import ReactDOM from 'react-dom/client'
import TranslatePopup from "Components/TranslatePopup/index.jsx"
import "./Main.scss" 

function main() {
    let translatePopupRoot = document.querySelector('#translate-popup-root')

    if(translatePopupRoot) ReactDOM.createRoot(settingsRoot).render(<>
        <TranslatePopup />
    </>)
}

main()