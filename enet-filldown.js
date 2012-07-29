//==========================================================
// DESCRIPTION: Plugin for filldown UI in the grids
// NOTES: Sample syntax give the id of the container table
//          $('.IDofContainerTable').fillDown({
//                    override: true
//                        , columns: '[{"columnIndex": "3"},{"columnIndex": "4"},{"columnIndex": "5"}]' 
//                }); 
//==========================================================

//TODO: 
//1. Ability to have a dropdown and filldown to a textbox so make it upto the user what they want on the top
//2. Send in class styling
//3. Ability to do some amount of validation
//4. refresh -> developer should be able to reload the control
//5. not error out on empty grid
//6. filldown by class, filldown by name
//7. Find out a way to revert back the last action

(function ($) {
    $.fn.extend({
        fillDown: function (options) {

            //Settings list and the default values
            var defaults = {
                override: false
                , columns: ''
            };

            var options = $.extend(defaults, options);
            return this.each(function () {

                //TODO: have to find a better way as we dont want to be passing the entire table object
                //Assign current element to variable
                var curTable = $(this);
                var curOptions = options;
                var columnParams = $.parseJSON(curOptions.columns);

                $.each(columnParams, function (index) {
                    var currColumnIndex = columnParams[index].columnIndex;
                    var validator = validateFillDown(curTable, currColumnIndex);

                    if (validator.isValid) {
                        //generate HTML
                        var enetHTML = autogenerateControl(validator.MappedField, validator.fillDownObj);

                        //populate the 
                        var $th = $(curTable).find('th').eq(currColumnIndex);
                        $th.html(enetHTML);

                        //bind click event on the button next to the element
                        $('#EWF-txtFillParent-' + validator.MappedField + '_Apply').on("click", function (event) {
                            event.preventDefault;
                            fillDown(this, curOptions);
                        });

                        //bind click event for checkbox 
                        //TODO: validate if this is the right method
                        $('#EWF-txtFillParent-' + validator.MappedField + '_ID').on("click", function (event) {
                            EnetCheckBox(this, curOptions);
                        });

                    }
                });  //columns each function

            }); //this.each(function () {
        }
    }); //fillDown: function (options) { 


    function EnetCheckBox(inElement, inCurrOptions) {
        var currIndex = $(inElement).closest('th').index();
        var fillDownID = $(inElement).attr('id');
        var currElementType = $('#' + fillDownID).get(0).tagName;
        var isChecked = 0;


        if ($(inElement).is(':checked')) {
            isChecked = 1;
        }
        else {
            isChecked = 0;
        }

        $("#" + fillDownID).closest('table').find('tr').each(function () {
            if (inCurrOptions.override) {
                //if condition to decide whether it is select/checkbox/input
                if (isChecked == 1) {
                    $(this).find('td').eq(currIndex).find(currElementType).attr('checked', true);

                }
                else {
                    $(this).find('td').eq(currIndex).find(currElementType).removeAttr('checked');
                }
            }
            else {

                if (isChecked == 1) {
                    $(this).find('td').eq(currIndex).find(currElementType).attr('checked', true);
                }
                else {
                    $(this).find('td').eq(currIndex).find(currElementType).removeAttr('checked');
                }
            }
        });
    }


    function fillDown(inElement, inCurrOptions) {
        //Validate if the value is selected
        var currImageID = $(inElement).attr('id');
        var currIndex = $(inElement).parent().parent().parent().index();

        //TODO: have to find a better way as it becomes a string manipulation
        //      have to validate whether there is a better way 'EWF-txtFillParent-txtFieldName_Apply => EWF-txtFillParent-txtFieldName_ID'

        var fillDownID = currImageID.replace("_Apply", "_ID").trim();
        var fillDownValue = $('#' + fillDownID).val();
        var currElementType = $('#' + fillDownID).get(0).tagName;

        if (fillDownValue != undefined || fillDownValue != '') {
            //            get column index
            $("#" + fillDownID).closest('table').find('tr').each(function () {
                if (inCurrOptions.override) {
                    //if condition to decide whether it is select/checkbox/input
                    $(this).find('td').eq(currIndex).find(currElementType).val(fillDownValue);
                }
                else {
                    if ($(this).find('td').eq(currIndex).find(currElementType).val() == "" || $(this).find('td').eq(currIndex).find(currElementType).val() == "-1") {
                        $(this).find('td').eq(currIndex).find(currElementType).val(fillDownValue);
                    }
                    else {
                        //do nothing leave whatever value that was present
                    }
                }
            });
        }
        else {
            alert('Please enter a select a valid value');
        }
    }


    function autogenerateControl(mappedField, objFilldown) {
        //find the element type
        var generatedComponent = '';
        var tagName = $("[id*='" + mappedField + "']").get(0).tagName.toLowerCase();

        if (tagName == undefined || tagName == '') {
            EUIShowInfoBar('Unable to to find the tag name of the fill down children');
        }
        else if (tagName == "select") {
            generatedComponent = generateDropDown(mappedField, objFilldown);
        }
        else if (tagName == "input") {
            //find the type
            var fieldType = $("[id*='" + mappedField + "']").attr('type');

            //could be textbox/checkbox
            if (fieldType == 'text') {
                generatedComponent = generateInput(mappedField, objFilldown);
            }
            else if (fieldType == "checkbox") {
                generatedComponent = generateCheckBox(mappedField, objFilldown);
            }
        }
        //        objFilldown.parent().attr("nowrap", "nowrap"); //Fix to make sure the filldown shows next to the input element
        //        objFilldown.parent().html(generatedComponent);
        return generatedComponent;
    }



    function generateDropDown(mappedField, objFilldown) {
        var component = '';
        //decide whether to depend of the current object or the children of the filldown
        component = '<div id="EWF-FillDown-Container"  nowrap="nowrap">'
        //component = component + '<select name="' + objFilldown.attr('name') + '" class="span5" id="' + objFilldown.attr('id') + '" form="' + objFilldown.closest("form").attr('id') + '">';
        component = component + '<select name="EWF-txtFillParent-' + mappedField + '" class="' + $("[id*='" + mappedField + "']").attr("class") + '" id="EWF-txtFillParent-' + mappedField + '_ID" form="' + objFilldown.closest("form").attr('id') + '">';
        component = component + $("[id*='" + mappedField + "']").html();
        component = component + '</select>';
        component = component + '   <a href="#"><img alt="Copy in all fields below" class="EWF-JQE-UpdateAmt" id="EWF-txtFillParent-' + mappedField + '_Apply" height="16px" width="16px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnVJREFUeNpck01rFEEQhqv6Yze72SSaYIwKMRADMeYqCHrR4MW7OefkTYgQvAj6G0T9AQp6FRXPHvWuXqKCKAkYEuNudueju7rLmtlM3LWhZ3p66n2q+p0aXH+3A8MDz2t2j5BDSx7ocNMw6nbA2m0A3hyMNgdJOixHnMuSdIW8L9blHjODsRZGmo1ZWQ8Dkiz/vwKK5EUkyRm5v8foCSKlyst6KNo4yTSQvZyRCDhSuQOlggEVgEINUarBAYgxGPpimY5YAgCidxWgqkAAEbTwG5ohoPkHGG/qo+xp5mC/6zmQE8pwBaAiKynuRIPhwI4Ius826tAoGXONmr5ItXz5VycBpVQ/9eGI0avJprkWdX0cGd+Laq8EbO12KgNaIU8fk3PTFIqz4KBXLK7Czn7nwV7S+FBrwgpXFbR7aQX4FJy7E/P0uRooa6AK9M7/MWhv5ZoSqAA5qzKicMLW6y8iuevksjUYYhTGi5Ha3NcKPwZxOlSA5WYORmJ/k4af3gpJ3/NElyTx4lH2Qmxqr5QxT3Y6XTg32oVJy0ACMjenuoWT0I0Knm1Z+ObCdob2bp16r7k4WP8b7DplN6aQ4+pMgKUxLAG59IvKxKyeiI2ErZ1KYe0MwdKEfpMFeOgdQeI8JGg2Flv4dXXaweXjEYpe6Er7FFpTNVGUawQFC/ILXRgL8FbO+/JHuDI/ips3ZvXT5WMaipYrhGLykUVGPsckEZ2W+0KMcYIQRzNmfXUK4ozRn8cttM82w3rPy4mZgzRcT3Rt6ZMv8rxtRATOOS2QhrxoSkBLXlhUanS+pb6LSu1ndBIxJLLvyn8lRmet1TLhrwADADZIT56vKModAAAAAElFTkSuQmCC"></a>';
        component = component + '</div>';
        return component;
    }

    function generateInput(mappedField, objFilldown) {
        var component = '';
        component = '<div id="EWF-FillDown-Container">'
        component = component + '   <input type="text" name="EWF-txtFillParent-' + mappedField + '" class="' + $("[id*='" + mappedField + "']").attr("class") + '" id="EWF-txtFillParent-' + mappedField + '_ID" form="' + objFilldown.closest("form").attr('id') + '">';
        component = component + '   <a href="#" nowrap="nowrap"><img alt="Copy in all fields below" class="EWF-JQE-UpdateAmt" id="EWF-txtFillParent-' + mappedField + '_Apply" height="16px" width="16px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnVJREFUeNpck01rFEEQhqv6Yze72SSaYIwKMRADMeYqCHrR4MW7OefkTYgQvAj6G0T9AQp6FRXPHvWuXqKCKAkYEuNudueju7rLmtlM3LWhZ3p66n2q+p0aXH+3A8MDz2t2j5BDSx7ocNMw6nbA2m0A3hyMNgdJOixHnMuSdIW8L9blHjODsRZGmo1ZWQ8Dkiz/vwKK5EUkyRm5v8foCSKlyst6KNo4yTSQvZyRCDhSuQOlggEVgEINUarBAYgxGPpimY5YAgCidxWgqkAAEbTwG5ohoPkHGG/qo+xp5mC/6zmQE8pwBaAiKynuRIPhwI4Ius826tAoGXONmr5ItXz5VycBpVQ/9eGI0avJprkWdX0cGd+Laq8EbO12KgNaIU8fk3PTFIqz4KBXLK7Czn7nwV7S+FBrwgpXFbR7aQX4FJy7E/P0uRooa6AK9M7/MWhv5ZoSqAA5qzKicMLW6y8iuevksjUYYhTGi5Ha3NcKPwZxOlSA5WYORmJ/k4af3gpJ3/NElyTx4lH2Qmxqr5QxT3Y6XTg32oVJy0ACMjenuoWT0I0Knm1Z+ObCdob2bp16r7k4WP8b7DplN6aQ4+pMgKUxLAG59IvKxKyeiI2ErZ1KYe0MwdKEfpMFeOgdQeI8JGg2Flv4dXXaweXjEYpe6Er7FFpTNVGUawQFC/ILXRgL8FbO+/JHuDI/ips3ZvXT5WMaipYrhGLykUVGPsckEZ2W+0KMcYIQRzNmfXUK4ozRn8cttM82w3rPy4mZgzRcT3Rt6ZMv8rxtRATOOS2QhrxoSkBLXlhUanS+pb6LSu1ndBIxJLLvyn8lRmet1TLhrwADADZIT56vKModAAAAAElFTkSuQmCC"></a>';
        component = component + '</div>';
        return component;
    }

    function generateCheckBox(mappedField, objFilldown) {
        var component = '';
        component = '<div id="EWF-FillDown-Container">'
        component = component + ' <input type="checkbox" name="EWF-txtFillParent-' + mappedField + '" class="' + $("[id*='" + mappedField + "']").attr("class") + '" id="EWF-txtFillParent-' + mappedField + '_ID" form="' + objFilldown.closest("form").attr('id') + '">';
        component = component + '</div>';
        return component;
    }


    function validateFillDown(inElement, currColumnIndex) {
        var isOpSuccessful = false;
        var strMappedFieldID = "";
        var objFillDown = "";

        //TODO: have to add a looper to do this all the columns that requires a fill down
        //if the column exists
        if ($(inElement).find("td:eq(" + currColumnIndex + ")").html() != null && $(inElement).find("td:eq(" + currColumnIndex + ")").html() != undefined) {

            //validate if the td contain input element, check box , select
            var currElement = $(inElement).find("td:eq(" + currColumnIndex + ")").find("input, select, checkbox");
            if (currElement != null && currElement != undefined) {
                objFillDown = $(currElement);
                strMappedFieldID = $(currElement).attr("id");
                isOpSuccessful = true;
            }
            else {
                EUIShowInfoBar('Unable to setup Fill Down because the specified column does not have a valid html element.');
                isOpSuccessful = false;
            }
        }
        else {
            EUIShowInfoBar('Unable to setup Fill Down because the specified column does not have a valid html element.');
            isOpSuccessful = false;
        }

        return {
            isValid: isOpSuccessful
            , MappedField: strMappedFieldID
            , fillDownObj: objFillDown
        }
    }

})(jQuery);


