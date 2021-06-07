import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {
    backgroundColor: '#FDFFE8',
    border: '1px solid black',
    padding: '1em',
    fontSize: '0.7em',
    display: 'inline-block',
    marginRight: '1em',
  },
});

export default (props) => {
  const classes = useStyles();

  return <pre className={classes.root} {...props} />;
};
