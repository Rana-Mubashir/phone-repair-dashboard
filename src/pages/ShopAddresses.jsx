import { Helmet } from "react-helmet-async"
import View from "../sections/shopAddresses/Index"

function ShopAddresses() {
    return (
        <>
        <Helmet>
            <title> Addresses Setting | Minimal UI </title>
        </Helmet>
        <View />
        </>
    )
}

export default ShopAddresses