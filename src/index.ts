// set default or saved colors
export * from "./$service$/StyleRules";
export * from "./$service$/DynamicEngine";
export * from "./$service$/ThemeEngine";

// TODO! make as module
export * from "./$service$/ImagePicker";

//
import theme from "./$service$/ThemeEngine";
import dynamic from "./$service$/DynamicEngine";

//
const initialize = (ROOT = document.documentElement)=>{
    theme(ROOT);
    dynamic(ROOT);
}

//
export default initialize;
