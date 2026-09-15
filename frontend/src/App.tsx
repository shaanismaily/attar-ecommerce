import { RouterProvider } from "react-router-dom";
import store from "./store/store";
import { Provider } from "react-redux";
import { router } from "./routes";
import AuthInitializer from "./components/AuthInitializer";

function App() {
  return (
      <Provider store={store}>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </Provider>
  );
}

export default App;
