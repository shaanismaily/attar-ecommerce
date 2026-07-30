import { BrowserRouter } from "react-router-dom"
import Navbar from "./components/Navbar"
import backgroundImage from "./assets/images/bg.avif"
function App() {

 return (
  <BrowserRouter>
    <div
      className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar />
    </div>
  </BrowserRouter>
  );
}

export default App
