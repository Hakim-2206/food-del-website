import {createContext, useEffect, useState} from "react";
import axios from "axios";
/*
import {food_list} from "../assets/assets.js";
*/

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "https://food-del-backend-ccwh.onrender.com"
    const [token, setToken] = useState("")
    const [food_list, setFoodList] = useState([])

    const addToCart = async (itemId) => {
        if (!itemId) {
            console.error("Item ID is undefined");
            return;
        }
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({...prev, [itemId]: 1}));
        } else {
            setCartItems((prev) => ({...prev, [itemId]: prev[itemId] + 1}));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", {itemId}, {headers: {token}})
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] - 1
        }));
        if (token) {
            try {
                await axios.post(url + "/api/cart/remove", {itemId}, {headers: {token}})

                const response = await axios.post(url + "/api/cart/get", {}, {headers: {token}})
                setCartItems(response.data.cartData || {})
            } catch (error) {
                console.log(error)
            }

        }
    }

    /*    useEffect(() => {
            console.log("Cart Items Updated:", cartItems);
        }, [cartItems]);*/

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item)
                totalAmount += itemInfo.price * cartItems[item]
            }
        }
        return totalAmount;
    }

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list")
        setFoodList(response.data.data)
    }

    const loadCartData = async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, {headers: {token}});
            setCartItems(response.data.cartData || {});
        } catch (error) {
            console.log("Error loading cart data:", error);
        }
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"))
                await loadCartData(localStorage.getItem("token"))
            }
        }

        loadData()
    }, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token, setToken

    }

    return (
        <StoreContext.Provider value={contextValue}>
            {/* eslint-disable-next-line react/prop-types */}
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;
