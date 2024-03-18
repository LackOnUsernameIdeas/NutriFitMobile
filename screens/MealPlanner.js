import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { EXPO_PUBLIC_OPENAI_API_KEY } from "@env";
import RecipeWidget from "../components/RecipeWidget";
import articles from "../constants/articles";
const { width } = Dimensions.get("screen");

class MealPlanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userPreferences: {
        Cuisine: "",
        Calories: "",
        Protein: "",
        Fat: "",
        Carbohydrates: "",
        Exclude: ""
      },
      isPlanGeneratedWithOpenAI: false,
      isPlanGeneratedWithBgGPT: false,
      mealPlanImages: {},
      mealPlan: {},
      requestFailed: false,
      isLoading: false
    };
  }

  handleInputChange = (key, value) => {
    // Validate numeric fields to accept only numbers
    if (
      key === "Calories" ||
      key === "Protein" ||
      key === "Fat" ||
      key === "Carbohydrates"
    ) {
      if (!isNaN(value)) {
        this.setState((prevState) => ({
          userPreferences: {
            ...prevState.userPreferences,
            [key]: value
          }
        }));
      }
    } else {
      this.setState((prevState) => ({
        userPreferences: {
          ...prevState.userPreferences,
          [key]: value
        }
      }));
    }
  };

  generatePlanWithOpenAI = async () => {
    try {
      this.setState({
        isPlanGeneratedWithOpenAI: true,
        isPlanGeneratedWithBgGPT: false,
        requestFailed: false,
        isLoading: true
      });
      const { userPreferences } = this.state;
      console.log("fetching openai");
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${EXPO_PUBLIC_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4-0125-preview",
            messages: [
              {
                role: "system",
                content: `You are an experienced nutritionist that supervises patients to eat only edible food that is from
                ${
                  Array.isArray(userPreferences.Cuisine)
                    ? userPreferences.Cuisine.length === 0
                      ? "every"
                      : userPreferences.Cuisine.length === 1
                      ? userPreferences.Cuisine[0]
                      : "the following"
                    : userPreferences.Cuisine
                } cuisine/cuisines. If you have been given French cuisine, try to avoid ratatouille, creme brulee, apple tart and omelette. Focus on creating an ACCURATE, diverse and delicious meal plan for the day that is comprised of the following limits: calories({userPreferences.Calories}), protein({userPreferences.Protein}), fat({userPreferences.Fat}) and carbohydrates({userPreferences.Carbohydrates}). Never go above or below the provided limits, and make SURE that the calories and fat are ALWAYS the same as the provided limits. Ensure the accuracy of the quantities while keeping true to the limits. Ensure that the meals you provide differ from meals you have given in previous requests, common meals you provide are Tarator, Banitsa, Cadaif, Cozonac, Moussaka and Quinoa. Ensure that you refrain from including the specified items. Export in JSON EXACTLY LIKE THE PROVIDED STRUCTURE in the content property in the body of this request without adding 'json' keyword with backticks. The response should only be pure json, nothing else. This means your response should not start with 'json*backticks*{data}*backticks*' or '*backticks*{data}*backticks*'.`
              },
              {
                role: "user",
                content: `Създайте ми дневно меню с ниско съдържание на мазнини, включващо едно ястие за закуска, три за обяд (третото трябва да е десерт) и две за вечеря (второто да бъде десерт). 
                Менюто трябва стриктно да спазва следните лимити: да съдържа ${userPreferences.Calories} калории, ${userPreferences.Protein} грама протеин, ${userPreferences.Fat} грама мазнини и ${userPreferences.Carbohydrates} грама въглехидрати. 
                НЕ Предоставяйте храни, които накрая имат значително по-малко количество калории, въглехидрати, протеин и мазнини в сравнение с посочените общи лимити (${userPreferences.Calories} калории, ${userPreferences.Protein} грама протеин, ${userPreferences.Fat} грама мазнини и ${userPreferences.Carbohydrates} грама въглехидрати) и НИКОГА, АБСОЛЮТНО НИКОГА не давай хранителен план, чийто сумирани стойности са с отклонение от лимитите на потребителя - 100 калории, 10 грама протеини, 20 грама въглехидрати, 10 грама мазнини. ДАВАЙ ВСЕКИ ПЪТ РАЗЛИЧНИ храни, а не еднакви или измислени рецепти.
                Включвай само съществуващи в реалния свят храни в хранителния план. Предоставете точни мерки и точни стойности за калории, протеин, въглехидрати и мазнини за закуска, обяд, вечеря и общо. Включете само реалистични храни за консумация. 
                Подсигури рецепти за приготвянето на храните и нужните продукти(съставки) към всяко едно ястие. Направи рецептите и съставките, така че да се получи накрая точното количество, което ще се яде, не повече от това.
                Имената на храните трябва да бъдат адекватно преведени и написани на български език и да са реални ястия за консумация. 
                Добави всички останали условия към менюто, но се увери, че избягваш стриктно да включваш следните елементи в менюто на храните: ${userPreferences.Exclude}. 
                Съобрази се с начина на приготвяне и рецептите вече като имаш в предвид какво НЕ ТРЯБВА да се включва.
                Имената на храните трябва да са адекватно преведени и написани, така че да са съществуващи храни. 
                Форматирай общата информацията за калориите, протеина, въглехидратите и мазнините по следния начин И ВНИМАВАЙ ТЯ ДА НЕ Е РАЗЛИЧНА ОТ ОБЩАТА СТОЙНОСТ НА КАЛОРИИТЕ, ВЪГЛЕХИДРАТИТЕ, ПРОТЕИНА И МАЗНИНИТЕ НА ЯСТИЯТА: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number,'grams':number}'. 
                Форматирай сумираните стойности по абсолютно същият начин: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number}'. 
                Форматирай ЦЯЛАТА информация в JSON точно така: '{
                breakfast':{
                  'main':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': 'number grams'}
                },
                'lunch':{
                  'appetizer':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': 'number grams'}, 
                  'main':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': 'number grams'}, 
                  'dessert':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': 'number grams'}
                }, 
                'dinner':{
                  'main':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': 'number grams'}, 
                  'dessert':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': 'number grams'}
                }', като не превеждаш имената на нито едно property (ТЕ ТРЯБВА ДА СА САМО НА АНГЛИЙСКИ ЕЗИК). 
                Не добавяй излишни кавички или думи, JSON формата трябва да е валиден. 
                Преведи САМО стойностите на БЪЛГАРСКИ, без нито едно property. Те трябва ЗАДЪЛЖИТЕЛНО да са на английски. 
                Грамажът на ястията е ЗАДЪЛЖИТЕЛНА стойност, която НЕ трябва да е повече от 500 грама. Не включвай грамажа в името на ястието, а го дай САМО като стойност в totals. 
                Името на ястието е ЗАДЪЛЖИТЕЛНО на български`
              }
            ]
          })
        }
      );

      if (!response.ok) {
        this.setState({
          requestFailed: true
        });
        throw new Error("Failed to generate meal plan");
      }
      console.log("res: ", response);
      const responseData = await response.json();

      const unescapedData = responseData.choices[0].message.content;
      const escapedData = decodeURIComponent(unescapedData);
      console.log("escapedData: ", escapedData);

      const data = JSON.parse(escapedData);

      console.log("OPENAI: ", data);

      const filteredArr = Object.fromEntries(
        Object.entries(data).filter(([key]) => key !== "totals")
      );

      const mealPlanImagesData = {
        breakfast: {
          main: ""
        },
        lunch: {
          appetizer: "",
          main: "",
          dessert: ""
        },
        dinner: {
          main: "",
          dessert: ""
        }
      };

      // Iterate over each meal and make a separate image generation request
      for (const mealKey of Object.keys(filteredArr)) {
        const mealAppetizer = filteredArr[mealKey].appetizer;
        const mealMain = filteredArr[mealKey].main;
        const mealDessert = filteredArr[mealKey].dessert;

        async function fetchImage(name) {
          try {
            let response = await fetch(
              `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyBGskRKof9dkcoXtReamm4-h7UorF1G7yM&cx=10030740e88c842af&q=${encodeURIComponent(
                name
              )}&searchType=image`
            );
            if (response.status === 429) {
              let response = await fetch(
                `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyBpwC_IdPQ2u-16x_9QwoqJDu-zMhuFKxs&cx=258e213112b4b4492&q=${encodeURIComponent(
                  name
                )}&searchType=image`
              );
              return response;
            } else {
              return response;
            }
          } catch (error) {
            console.error("Error fetching image:", error);
            return null;
          }
        }

        const imageAppetizer =
          mealKey === "lunch" ? await fetchImage(mealAppetizer.name) : null;

        const imageMain = await fetchImage(mealMain.name);

        const imageDessert =
          mealKey === "lunch" || mealKey === "dinner"
            ? await fetchImage(mealDessert.name)
            : null;

        const imageAppetizerResponseData =
          imageAppetizer !== null ? await imageAppetizer.json() : null;
        const imageMainResponseData = await imageMain.json();
        const imageDessertResponseData =
          imageDessert !== null ? await imageDessert.json() : null;

        if (
          imageAppetizerResponseData !== null &&
          imageAppetizerResponseData?.items?.[0]?.link
        ) {
          mealPlanImagesData[mealKey].appetizer =
            imageAppetizerResponseData.items[0].link;
        }

        if (imageMainResponseData?.items?.[0]?.link) {
          mealPlanImagesData[mealKey].main =
            imageMainResponseData.items[0].link;
        }

        if (
          imageDessertResponseData !== null &&
          imageDessertResponseData?.items?.[0]?.link
        ) {
          mealPlanImagesData[mealKey].dessert =
            imageDessertResponseData.items[0].link;
        }
      }

      console.log("mealPlanImagesData:", mealPlanImagesData);

      this.setState({
        mealPlanImages: mealPlanImagesData,
        mealPlan: data,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        requestFailed: true
      });
      console.error("Error generating meal plan:", error);
    }
  };

  generatePlanWithBgGPT = async () => {
    try {
      this.setState({
        isPlanGeneratedWithOpenAI: false,
        isPlanGeneratedWithBgGPT: true,
        requestFailed: false
      });

      const requestBody = {
        inputs: `Вие сте опитен диетолог, който наблюдава пациентите си дали консумират само ядлива храна от българската кухня и искам всичко, което даваш ТИ да е на БЪЛГАРСКИ ЕЗИК. Създайте ми дневно меню с ниско съдържание на мазнини, включващо едно ястие за закуска, три за обяд (третото трябва да е десерт) и две за вечеря (второто да бъде десерт). Менюто трябва стриктно да спазва следните лимити: да съдържа 2806.5 калории, 146.35 грама протеин, 68.23 грама мазнини и 319.39 грама въглехидрати. НЕ Предоставяйте храни, които накрая имат значително по-малко количество калории, въглехидрати, протеин и мазнини в сравнение с посочените общи лимити (2806.5 калории, 146.35 грама протеин, 68.23 грама мазнини и 319.39 грама въглехидрати) и НИКОГА, АБСОЛЮТНО НИКОГА не давай хранителен план, чийто сумирани стойности са с отклонение от лимитите на потребителя - 100 калории, 10 грама протеини, 20 грама въглехидрати, 10 грама мазнини. ДАВАЙТЕ ВСЕКИ ПЪТ РАЗЛИЧНИ храни, а не еднакви или измислени рецепти. Включвай само съществуващи в реалния свят храни в хранителния план. Предоставете точни мерки и точни стойности за калории, протеин, въглехидрати и мазнини за закуска, обяд, вечеря и общо. Включете само реалистични храни за консумация. Подсигури рецепти за приготвянето на храните и нужните продукти(съставки) към всяко едно ястие. Направи рецептите и съставките, така че да се получи накрая точното количество, което ще се яде, не повече или по-малко от това. Добави всички останали условия към менюто, но се увери, че избягваш стриктно да включваш следните елементи в менюто на храните: ориз. Съобрази се с начина на приготвяне и рецептите вече като имаш в предвид какво НЕ ТРЯБВА да се включва. Имената на храните трябва да са адекватно преведени и написани, така че да са съществуващи храни. Форматирай общата информацията за калориите, протеина, въглехидратите и мазнините по следния начин И ВНИМАВАЙ ТЯ ДА НЕ Е РАЗЛИЧНА ОТ ОБЩАТА СТОЙНОСТ НА КАЛОРИИТЕ, ВЪГЛЕХИДРАТИТЕ, ПРОТЕИНА И МАЗНИНИТЕ НА ЯСТИЯТА: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number,'grams':number}'. Форматирай сумираните стойности по абсолютно същият начин: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number}'. Форматирай ЦЯЛАТА информация в JSON точно така: '{breakfast':{'main':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string'...], 'recipeQuantity': 'number'}},'lunch':{'appetizer':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string'...], 'recipeQuantity': 'number'},'main':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string'...], 'recipeQuantity': 'number'},'dessert':{'name':'string','totals':{'calories':'number','protein':'number','fat':'number','carbohydrates':'number','grams':'number'}, 'ingredients':['quantity ingredient','quantity ingredient''...], 'instructions':['1.string','2.string'...], 'recipeQuantity': 'number'}},'dinner':{'main':{'name':'string','totals':{...}, 'ingredients':[...], 'instructions':[...], 'recipeQuantity': 'number'},'dessert':{'name':'string','totals':{...}, 'ingredients':[...], 'instructions':[...],'recipeQuantity': 'number'}}'. Имената на храните, съставките и стъпките за приготвяне трябва да са на БЪЛГАРСКИ ЕЗИК! В 'instructions', инструкциите трябва да са отделни стрингове, които да са номерирани. 'recipeQuantity' трябва да е просто number за грамове, а не string. Стойността на 'recipeQuantity' всъщо трябва винаги да е само и единствено число без никакви мерни единици. Стойността на 'recipeQuantity' е грамажа на ястието получено от рецептата. Съобразявай се с рецептата от 'instructions' когато определяш стойността на 'recipeQuantity'. Стойността на 'grams' е количеството храна в грамове, което потребителя трябва да изяде!! 'grams' никога не трябва да е под 200г! Препоръчвай всеки път различни ястия от миналият ти отговор.`,
        id: "1b29f1e8-b189-4e34-bb98-65ad3c7c1182"
      };

      const response = await fetch("https://nutri-api.noit.eu/fetchChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("Failed to generate meal plan with BgGPT");
      }
      const responseData = await response.json();
      console.log("Response Data:", responseData);

      const escapedJSON = responseData.response;
      const jsonString = escapedJSON.replace(/\\n/g, "").replace(/\\"/g, '"');
      const fixedjsonString = jsonString.replace(/,\s*]/g, "]");

      const jsonObject = JSON.parse(fixedjsonString);
      console.log("OBJECT:", jsonObject);
      const mealPlanImagesData = {
        breakfast: {
          main: ""
        },
        lunch: {
          appetizer: "",
          main: "",
          dessert: ""
        },
        dinner: {
          main: "",
          dessert: ""
        }
      };

      // Iterate over each meal and make a separate image generation request
      for (const mealKey of Object.keys(jsonObject)) {
        const meal = jsonObject[mealKey];
        const mealAppetizer = meal.appetizer;
        const mealMain = meal.main;
        const mealDessert = meal.dessert;

        async function fetchImage(name) {
          try {
            let response = await fetch(
              `https://customsearch.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(
                name
              )}&searchType=image`
            );
            if (response.status === 429) {
              let response = await fetch(
                `https://customsearch.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(
                  name
                )}&searchType=image`
              );
              return response;
            } else {
              return response;
            }
          } catch (error) {
            console.error("Error fetching image:", error);
            return null;
          }
        }

        // Process images for appetizer
        if (mealAppetizer && mealAppetizer.name) {
          const imageAppetizer = await fetchImage(mealAppetizer.name);
          const imageAppetizerResponseData = await imageAppetizer.json();
          if (
            imageAppetizerResponseData !== null &&
            imageAppetizerResponseData?.items?.[0]?.link
          ) {
            mealPlanImagesData[mealKey].appetizer =
              imageAppetizerResponseData.items[0].link;
          }
        }

        // Process images for main course
        if (mealMain && mealMain.name) {
          const imageMain = await fetchImage(mealMain.name);
          const imageMainResponseData = await imageMain.json();
          if (imageMainResponseData?.items?.[0]?.link) {
            mealPlanImagesData[mealKey].main =
              imageMainResponseData.items[0].link;
          }
        }

        // Process images for dessert
        if (mealDessert && mealDessert.name) {
          const imageDessert = await fetchImage(mealDessert.name);
          const imageDessertResponseData = await imageDessert.json();
          if (
            imageDessertResponseData !== null &&
            imageDessertResponseData?.items?.[0]?.link
          ) {
            mealPlanImagesData[mealKey].dessert =
              imageDessertResponseData.items[0].link;
          }
        }
      }

      this.setState({
        mealPlanImages: mealPlanImagesData,
        mealPlan: jsonObject
      });
    } catch (error) {
      this.setState({
        requestFailed: true
      });
      console.error("Error generating meal plan with BgGPT:", error);
    }
  };

  // generatePlanWithGemini = async () => {
  //   try {
  //     this.setState({
  //       isPlanGeneratedWithBgGPT: true,
  //       isPlanGeneratedWithOpenAI: false
  //     });

  //     const API_KEY = "AIzaSyABczafdONRkfzzbKXHMpnwCFnuV4-xLUs";
  //     const genAI = new GoogleGenerativeAI(API_KEY);
  //     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  //     const prompt = `prompt`;

  //     const result = await model.generateContent(prompt);

  //     const response = result.response;
  //     const text = response.text();
  //     console.log("text: ", text);

  //     const stringToRepair = text
  //       .replace(/^```json([\s\S]*?)```$/, "$1")
  //       .replace(/^```JSON([\s\S]*?)```$/, "$1")
  //       .replace(/^'|'$/g, "") // Remove single quotes at the beginning and end
  //       .trim();
  //     console.log("stringToRepair: ", stringToRepair);
  //     const jsonObject = JSON.parse(stringToRepair);

  //     console.log("jsonObject: ", jsonObject);

  //     const mealPlanImagesData = {
  //       breakfast: {
  //         main: ""
  //       },
  //       lunch: {
  //         appetizer: "",
  //         main: "",
  //         dessert: ""
  //       },
  //       dinner: {
  //         main: "",
  //         dessert: ""
  //       }
  //     };

  //     for (const mealKey of Object.keys(jsonObject)) {
  //       if (mealKey !== "totals") {
  //         const mealAppetizer = jsonObject[mealKey].appetizer;
  //         const mealMain = jsonObject[mealKey].main;
  //         const mealDessert = jsonObject[mealKey].dessert;

  //         async function fetchImage(name) {
  //           try {
  //             let response = await fetch(
  //               `https://customsearch.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(
  //                 name
  //               )}&searchType=image`
  //             );
  //             if (response.status === 429) {
  //               let response = await fetch(
  //                 `https://customsearch.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(
  //                   name
  //                 )}&searchType=image`
  //               );
  //               return response;
  //             } else {
  //               return response;
  //             }
  //           } catch (error) {
  //             console.error("Error fetching image:", error);
  //             return null;
  //           }
  //         }

  //         const imageAppetizer =
  //           mealKey === "lunch" ? await fetchImage(mealAppetizer.name) : null;

  //         const imageMain = await fetchImage(mealMain?.name);

  //         const imageDessert =
  //           mealKey === "lunch" || mealKey === "dinner"
  //             ? await fetchImage(mealDessert.name)
  //             : null;

  //         const imageAppetizerResponseData =
  //           imageAppetizer !== null ? await imageAppetizer.json() : null;
  //         const imageMainResponseData = await imageMain.json();
  //         const imageDessertResponseData =
  //           imageDessert !== null ? await imageDessert.json() : null;

  //         console.log("mealPlanImagesData: ", mealPlanImagesData);

  //         if (
  //           imageAppetizerResponseData !== null &&
  //           imageAppetizerResponseData?.items?.[0]?.link
  //         ) {
  //           mealPlanImagesData[mealKey].appetizer =
  //             imageAppetizerResponseData.items[0].link;
  //         }

  //         if (imageMainResponseData?.items?.[0]?.link) {
  //           console.log("mealPlanImagesData[mealKey].main: ", mealKey);
  //           mealPlanImagesData[mealKey].main =
  //             imageMainResponseData.items[0].link;
  //         }

  //         if (
  //           imageDessertResponseData !== null &&
  //           imageDessertResponseData?.items?.[0]?.link
  //         ) {
  //           mealPlanImagesData[mealKey].dessert =
  //             imageDessertResponseData.items[0].link;
  //         }
  //       }
  //     }

  //     setMealPlanImages(mealPlanImagesData);

  //     setMealPlan({
  //       breakfast: jsonObject.breakfast,
  //       lunch: jsonObject.lunch,
  //       dinner: jsonObject.dinner
  //     });
  //     setIsLoading(false);
  //   } catch (error) {
  //     this.setState({
  //       requestFailed: true
  //     });
  //     console.error("Error generating meal plan:", error);
  //   }
  // };

  render() {
    const { isLoading, userPreferences } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Cuisine"
              value={userPreferences.Cuisine}
              onChangeText={(text) => this.handleInputChange("Cuisine", text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Calories"
              value={userPreferences.Calories}
              onChangeText={(text) => this.handleInputChange("Calories", text)}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Protein"
              value={userPreferences.Protein}
              onChangeText={(text) => this.handleInputChange("Protein", text)}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Fat"
              value={userPreferences.Fat}
              onChangeText={(text) => this.handleInputChange("Fat", text)}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Carbohydrates"
              value={userPreferences.Carbohydrates}
              onChangeText={(text) =>
                this.handleInputChange("Carbohydrates", text)
              }
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Exclude"
              value={userPreferences.Exclude}
              onChangeText={(text) => this.handleInputChange("Exclude", text)}
              style={styles.input}
            />
          </View>
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={this.generatePlanWithOpenAI}
            >
              <Text style={styles.buttonText}>Generate with OpenAI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={this.generatePlanWithBgGPT}
            >
              <Text style={styles.buttonText}>Generate with BgGPT</Text>
            </TouchableOpacity>
          </View>

          {Object.keys(this.state.mealPlan).map((mealType, index) => {
            const meal = this.state.mealPlan[mealType];
            const mealImages = this.state.mealPlanImages[mealType]; // Get all images for the meal type

            return (
              <React.Fragment key={index} style={styles.inputContainer}>
                {/* Map through each item in the meal type */}
                {Object.keys(meal).map((itemType) => {
                  const item = meal[itemType]; // Get the item details
                  const mealImage = mealImages ? mealImages[itemType] : null; // Get the image for the item

                  // Check if item exists before rendering RecipeWidget
                  if (item) {
                    return (
                      <RecipeWidget
                        key={`${mealType}-${itemType}`}
                        image={mealImage}
                        item={item}
                      />
                    );
                  } else {
                    // Handle case where item is undefined
                    return null;
                  }
                })}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between"
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // Add padding to create space between the top of the container and the first input field
    paddingBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 15,
    padding: 10,
    marginBottom: 10
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20, // Adjust the margin between the input fields and buttons
    marginBottom: 20 // Add margin to separate the buttons from the input fields
  },
  button: {
    flex: 1,
    backgroundColor: "blue",
    borderRadius: 10,
    justifyContent: "center",
    marginHorizontal: 5 // Adjust the horizontal margin of each button
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default MealPlanner;
