
import ReactDOM from 'react-dom/client';
import 'assets/styles/global.css'
import App from './App';
import { Provider } from "react-redux";
import { persistor, store } from "store";
import { PersistGate } from "redux-persist/lib/integration/react";
import { I18nProvider } from "i18n";


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
  <PersistGate persistor={persistor}>
    <I18nProvider>
      <App />
    </I18nProvider>
  </PersistGate>
</Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

