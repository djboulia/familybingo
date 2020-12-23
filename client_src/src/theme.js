import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#222987',
    },
    secondary: {
      // main: '#19857b',
      main: '#256026',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
    bingoCard: {
      header: '#222987',
      selected: '#F5624D',
      bingo: '#FFD700',
    },
  },
});

export default theme;
