import { BrowserRouter } from "react-router-dom"
import Navbar from "./components/Navbar"
import backgroundImage from "./assets/images/bg.avif"
import Login from "./components/Login";
import store from "./store/store";
import { Provider } from "react-redux";

function App() {

 return (
   <BrowserRouter>
   <Provider store={store}>

    <div  className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}> 
     
      <Navbar />
    </div>
      <Login />
      </Provider>
  </BrowserRouter>
  );
}

export default App
