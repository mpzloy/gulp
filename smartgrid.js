const smartgrid = require('smart-grid');

smartgrid('./src/less', {
    columns: 12,
    offset: "30px",
    container: {
        maxWidth: "1440px"
    },
    breakPoints: {
        lg: {
            width: "1280px",
            fields: "20px"
        },
        md: {
            width: "1024px",
            fields: "20px"
        },
        sm: {
            width: "768px",
            fields: "20px"
        },
        xs: {
            width: "576px",
            fields: "15px"
        }
    },
    oldSizeStyle: false
});