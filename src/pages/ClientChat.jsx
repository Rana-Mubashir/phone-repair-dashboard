import { Helmet } from "react-helmet-async"
import View from '../sections/clientChat/Index'
function ClientChat() {
    return (
        <>
        <Helmet>
            <title> Chat | Minimal UI </title>
        </Helmet>
        <View />
        </>
    )
}

export default ClientChat