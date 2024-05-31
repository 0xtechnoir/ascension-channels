import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider, createTheme } from "@mui/material";

import {
  SmartObjectProvider,
  FeedbackProvider,
  WalletProvider,
  WorldProvider,
} from "@eveworld/contexts";

import App from "./App";
import EntityView from "./components/EntityView";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          border: "1px solid hsla(26, 85%, 58%, 1)",
          borderRadius: "0px !important",
          padding: "8px !important",
          "&:focus": {
            borderColor: "hsla(60, 100%, 92%, 1)",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "hsla(60, 100%, 92%, 1)",
          fontFamily: "Sometype Mono",
          padding: "0px !important",
          outline: "none",
          fontSize: "0.875rem",
        },
        input: {
          padding: "0px !important",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          border: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "0px !important",
        },
    }
  },
    MuiAlert: {
      styleOverrides: {
        root: {
          letterSpacing: 0,
        },
        message: {
          padding: "8px 16px !important",
        },
    }
  },
}});

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "*",
        element: <EntityView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WalletProvider>
    <WorldProvider>
      <ThemeProvider theme={darkTheme}>
        <SmartObjectProvider>
          <FeedbackProvider>
            <RouterProvider router={router} />
          </FeedbackProvider>
        </SmartObjectProvider>
      </ThemeProvider>
    </WorldProvider>
  </WalletProvider>
);
