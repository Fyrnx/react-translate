import ReactDOM from 'react-dom/client'
import Settings from "Components/SettingsPage/index.jsx"
import "./Main.scss" 

function main() {
    let settingsRoot = document.querySelector('#settings-root')

    if(settingsRoot) ReactDOM.createRoot(settingsRoot).render(<>
        <Settings />
    </>)
}

main()