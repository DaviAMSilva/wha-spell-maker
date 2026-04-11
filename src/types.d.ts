import p5 from "p5";

declare global {
    interface Window {
        myp5: p5;
        Handlebars: any;
        jsonEditor: any;
        JSONEditor: any;
        __PRERENDER_READY__: boolean;
    }
}
