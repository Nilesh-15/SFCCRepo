var Template = require("dw/util/Template");
var HashMap = require("dw/util/HashMap");

/**
 * This function generates a random value string
 * @returns {string}
 */
function generateRandomValue() {
    return Math.random().toString(36).substr(2);
}

module.exports.render = function (context) {
    var content = context.content;
    var model = new HashMap();
    if (content) {
        model.randomValue = generateRandomValue();
        model.faqQuestion = content.faqQuestion;
        model.faqAnswer = content.faqAnswer;
        model.parent_id = context.componentRenderSettings.attributes
            ? context.componentRenderSettings.attributes.parent_region
            : "";
    }
    return new Template(
        "experience/components/custom_assets/questionAnswer"
    ).render(model).text;
};
