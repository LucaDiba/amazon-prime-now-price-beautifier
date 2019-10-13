var internationalSystemUnitsConverter = function(startingAmount, measurementUnit) {
    if (measurementUnit === 'kg') {
        finalAmount = startingAmount;
        finalMeasurementUnit = 'kg';
    } else if (measurementUnit === 'g' || measurementUnit === 'gr') {
        finalAmount = startingAmount * 1000;
        finalMeasurementUnit = 'kg';
    } else if (measurementUnit === 'l'){
        finalAmount = startingAmount;
        finalMeasurementUnit = 'l';
    } else if (measurementUnit === 'dl') {
        finalAmount = startingAmount * 10;
        finalMeasurementUnit = 'l';
    } else if (measurementUnit === 'cl') {
        finalAmount = startingAmount * 100;
        finalMeasurementUnit = 'l';
    } else if (measurementUnit === 'ml') {
        finalAmount = startingAmount * 1000;
        finalMeasurementUnit = 'l';
    } else {
        finalAmount = startingAmount;
        finalMeasurementUnit = (unitSize !== 1) ? unitSize + ' ' : '';
        finalMeasurementUnit += measurementUnit;
    }

    return [finalAmount, finalMeasurementUnit];
}

var changePriceFunction = function(parsedElements){
    let pricePerUnitClassName = document.querySelector("div[class^='asin_price__pricePerUnit__']").className;
    var elements = document.querySelectorAll("div[class^='asin_card__root__']");

    for (i = 0; i < elements.length; ++i) {
        let element = elements[i];

        let href = element.children[0].getAttribute('href');

        if( !parsedElements.includes(href)) {
            parsedElements.push(href);
            try{
                let priceFound = false;
                let pricePerUnitFinal;
                let finalMeasurementUnit;

                /* METHOD ONE */
                let priceElement = element.children[1].children[0].children[0].children[1].children[0];
                if (priceElement.childElementCount >= 3) {
                    pricePerUnitElement = priceElement.children[2];
                    let pricePerUnitRegex = new RegExp(/^\(€ ([\d]+,[\d]+)\/([\d]+)? ?([A-Za-z]+)\)$/, 'i').exec(pricePerUnitElement.innerHTML);

                    if(pricePerUnitRegex !== null) {
                        let pricePerUnit = parseFloat(pricePerUnitRegex[1].replace(',', '.'));
                        let unitSize = (pricePerUnitRegex[2] !== undefined) ? parseInt(pricePerUnitRegex[2]) : 1;
                        let measurementUnit = pricePerUnitRegex[3];
                    
                        [pricePerUnitFinal, finalMeasurementUnit] = internationalSystemUnitsConverter(pricePerUnit/unitSize, measurementUnit);

                        priceFound = true;
                        if (finalMeasurementUnit !== measurementUnit) {
                            pricePerUnitFinal = pricePerUnitFinal.toFixed(2).replace('.', ',');
                            pricePerUnitElement.innerHTML = `€ ${pricePerUnitFinal}/${finalMeasurementUnit} ${pricePerUnitElement.innerHTML}`;
                        }
                    }
                }

                /* METHOD TWO */
                if (!priceFound) {
                    // Item title
                    let elementTitle = priceElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1];
                    
                    let totalPrice;
                    let priceDiscount = priceElement.querySelector("div[class^='asin_price__priceDiscount__']");
                    if (priceDiscount) {
                        totalPrice = priceDiscount.innerHTML;
                    } else {
                        totalPrice = priceElement.querySelector("div[class^='asin_price__priceFull__']").innerHTML;
                    }

                    let totalPriceRegex = /€ ([\d]+),([\d]+)/.exec(totalPrice);
                        totalPrice = parseFloat(totalPriceRegex[1] +'.'+ totalPriceRegex[2]);
                    let totalWeight;

                    /* e.g.: "700,0 gr", "ml 100"... */
                    let titleRegex = new RegExp(/(([\d]+)[.,]?([\d]*) *(gr|g|mg|l|dl|cl|ml))|((gr|g|mg|l|dl|cl|ml) *([\d]+)[.,]?([\d]*))/, 'i').exec(elementTitle.innerText);

                    if(titleRegex !== null){
                        if(titleRegex[1]) {
                            /**
                             * 700,20 gr
                             * [2]: 700
                             * [3]: 20
                             * [4]: "gr"
                             */

                            totalWeight = parseFloat(titleRegex[2] +'.'+ titleRegex[3]);
                            measurementUnit = titleRegex[4];
                        } else if (titleRegex[5]) {
                            /**
                             * gr 700,20
                             * [6]: "gr"
                             * [7]: 700
                             * [8]: 20
                             */

                            totalWeight = parseFloat(titleRegex[7] +'.'+ titleRegex[8]).toFixed(2);
                            measurementUnit = titleRegex[6];
                        }

                        [pricePerUnitFinal, finalMeasurementUnit] = internationalSystemUnitsConverter(totalPrice/totalWeight, measurementUnit);
                        
                        priceFound = true;
                        pricePerUnitFinal = pricePerUnitFinal.toFixed(2).replace('.', ',');

                        var div = document.createElement("div");
                            div.className = pricePerUnitClassName;
                            div.innerHTML = `€ ${pricePerUnitFinal}/${finalMeasurementUnit} (€ ${totalPrice.toFixed(2)} per ${totalWeight} ${measurementUnit})`;
                        element.children[1].children[0].children[0].children[1].children[0].appendChild(div);
                    }
                }

                /* END */
            } catch(error) {
                console.error(`i = ${i} - ERROR - ${error}`);
                console.log(element);
            }
        }
    }
    // var pricePerUnitArray = document.querySelectorAll("div[class^='asin_price__priceUnit__']");

    // for (i = 0; i < pricePerUnitArray.length; ++i) {
    //     try{
    //         let pricePerUnitElement = pricePerUnitArray[i];
    //         pricePerUnitElement.innerHTML = 'IT WORKS';
    //     } catch(error) {
    //         console.error(`i = ${i} - ERROR - ${error}`);
    //     }
    // }
}

var tryPriceGettingMethods = function(pricePerUnitElement) {

}

var parsedElements = [];
setInterval(changePriceFunction, 1000, parsedElements);