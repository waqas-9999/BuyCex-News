import { useEffect, useState } from "react";
import Footer from "../components/global/Footer";
import Navbar from "../components/global/Navbar";
import { IoIosArrowUp } from "react-icons/io";


const Main = props => {

	return (
		<>				
				<Navbar/>
				{props.children}
				<Footer/>
		</>
	);
};

export default Main;
