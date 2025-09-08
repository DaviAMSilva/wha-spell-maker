import p5 from "p5";

declare global {
    interface Window {
        myp5: p5;
        DOMPurify: any;
        Handlebars: any;
        jsonEditor: any;
        JSONEditor: any;
    }
}
