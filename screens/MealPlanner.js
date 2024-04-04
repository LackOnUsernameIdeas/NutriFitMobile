import React, { useState, useEffect } from "react";
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
const { width } = Dimensions.get("screen");
import { getAuth } from "firebase/auth";
import DailyCalorieRequirements from "./DailyCalorieRequirements";
import { Card } from "../components";
import { nutriTheme } from "../constants";

class MealPlanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      userPreferences: {
        Cuisine: "",
        Calories: "",
        Protein: "",
        Fat: "",
        Carbohydrates: "",
        Exclude: ""
      },
      activityLevel: 1,
      userData: {},
      perfectWeight: null,
      differenceFromPerfectWeight: null,
      health: "",
      recommendedGoal: "",
      dailyCaloryRequirements: [],
      macroNutrients: [],
      isPlanGeneratedWithOpenAI: false,
      isPlanGeneratedWithGemini: false,
      mealPlanImages: {},
      mealPlan: {},
      requestFailed: false,
      isLoading: false
    };
  }

  componentDidMount() {
    const auth = getAuth();
    this.unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ currentUser: user });
      } else {
        this.setState({ currentUser: null });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentUser !== this.state.currentUser &&
      this.state.currentUser
    ) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fetchData = async () => {
    try {
      const uid = this.state.currentUser.uid;
      const date = new Date().toISOString().slice(0, 10);
      const response = await fetch(
        "https://nutri-api.noit.eu/weightStatsAndMealPlanner",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
          },
          body: JSON.stringify({
            uid: uid,
            date: date
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weight stats");
      }

      const weightStatsData = await response.json();

      // Update state with fetched data
      this.setState({
        userData: {
          gender: weightStatsData.userDataSaveable.gender,
          goal: weightStatsData.userDataSaveable.goal,
          age: weightStatsData.userDataSaveable.age,
          height: weightStatsData.userDataSaveable.height,
          waist: weightStatsData.userDataSaveable.waist,
          neck: weightStatsData.userDataSaveable.neck,
          hip: weightStatsData.userDataSaveable.hip,
          weight: weightStatsData.userDataSaveable.weight
        },
        perfectWeight: weightStatsData.perfectWeight,
        differenceFromPerfectWeight: {
          difference:
            weightStatsData?.differenceFromPerfectWeight?.difference || 0,
          isUnderOrAbove:
            weightStatsData?.differenceFromPerfectWeight?.isUnderOrAbove || ""
        },
        health: weightStatsData.bmiIndex.health,
        recommendedGoal: this.calculateRecommendedGoal(
          weightStatsData.differenceFromPerfectWeight
        ),
        dailyCaloryRequirements: weightStatsData.dailyCaloryRequirements,
        macroNutrients: weightStatsData.macroNutrientsData
      });
    } catch (error) {
      console.error("Error fetching weight stats:", error);
    }
  };

  calculateRecommendedGoal = (differenceFromPerfectWeight) => {
    const difference = differenceFromPerfectWeight.difference;
    const underOrAbove = differenceFromPerfectWeight.isUnderOrAbove;

    let recommendedGoal;

    if (Math.abs(difference) < 2) {
      recommendedGoal = "Запазите";
    } else if (underOrAbove === "under" && Math.abs(difference) >= 2) {
      recommendedGoal = "Качвате";
    } else if (underOrAbove === "above" && Math.abs(difference) >= 2) {
      recommendedGoal = "Сваляте";
    }

    return recommendedGoal + " (кг.)";
  };

  handleInputChange = (key, value) => {
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

  render() {
    const cuisineTranslation = {
      Italian: "Италианска",
      Bulgarian: "Българска",
      Spanish: "Испанска",
      French: "Френска"
    };

    translateCuisine = (englishCuisine) => {
      if (Array.isArray(englishCuisine)) {
        return englishCuisine.map(
          (cuisine) => cuisineTranslation[cuisine] || cuisine
        );
      } else {
        return cuisineTranslation[englishCuisine] || englishCuisine;
      }
    };

    const translatedCuisine = translateCuisine(
      this.state.userPreferences.Cuisine
    );

    let promptCuisine;

    if (Array.isArray(translatedCuisine)) {
      promptCuisine = translatedCuisine.join(", ");
    } else {
      promptCuisine = translatedCuisine;
    }
    console.log("TRANSLATED --->", promptCuisine);
    let cuisinePhrase;

    if (Array.isArray(this.state.userPreferences.Cuisine)) {
      if (this.state.userPreferences.Cuisine.length === 0) {
        cuisinePhrase = "всяка";
      } else if (this.state.userPreferences.Cuisine.length === 1) {
        cuisinePhrase = this.state.userPreferences.Cuisine[0];
      } else {
        cuisinePhrase = "следните";
      }
    } else {
      cuisinePhrase = this.state.userPreferences.Cuisine;
    }
    console.log("cuisinePhrase --->", cuisinePhrase);
    const prompt = `Вие сте опитен диетолог, който наблюдава пациентите да консумират само ядлива и традиционна храна от
      ${cuisinePhrase} кухня/кухни (${promptCuisine}). Фокусирайте се върху създаването на ТОЧЕН, разнообразен и вкусен дневен хранителен план, съставен от следните ограничения: калории (${
      this.state.userPreferences.Calories
    }), протеин (${this.state.userPreferences.Protein}), мазнини (${
      this.state.userPreferences.Fat
    }) и въглехидрати (${
      this.state.userPreferences.Carbohydrates
    }). Никога не превишавайте или намалявайте предоставените лимити и се УВЕРЕТЕ, че калориите и мазнините ВИНАГИ са същите като предоставените лимити.
        Осигурете точността на количествата, като същевременно се придържате към лимитите.
        Уверете се, че предоставените от вас хранения се различават от тези, които сте предоставили в предишни заявки. Давай винаги нови и вкусни храни, така че винаги да се създаде уникално и разнообразно меню.
        Експортирайте в JSON ТОЧНО КАТО ПРЕДОСТАВЕНАТА СТРУКТУРА в съдържанието на този заявка, без да добавяте 'json' ключова дума с обратни кавички.
        Отговорът трябва да бъде чист JSON, нищо друго. Това означава, че вашият отговор не трябва да започва с 'json*backticks*{data}*backticks*' или '*backticks*{data}*backticks*'.
        Създайте ми дневно меню с ниско съдържание на мазнини, включващо едно ястие за закуска, три за обяд (третото трябва да е десерт) и две за вечеря (второто да бъде десерт).
        Менюто трябва стриктно да спазва следните лимити: да съдържа ${
          this.state.userPreferences.Calories
        } калории, ${this.state.userPreferences.Protein} грама протеин, ${
      this.state.userPreferences.Fat
    } грама мазнини и ${
      this.state.userPreferences.Carbohydrates
    } грама въглехидрати.
        НЕ Предоставяйте храни, които накрая имат значително по-малко количество калории, въглехидрати, протеин и мазнини в сравнение с посочените общи лимити (${
          this.state.userPreferences.Calories
        } калории, ${this.state.userPreferences.Protein} грама протеин, ${
      this.state.userPreferences.Fat
    } грама мазнини и ${
      this.state.userPreferences.Carbohydrates
    } грама въглехидрати) и НИКОГА, АБСОЛЮТНО НИКОГА не давай хранителен план, чийто сумирани стойности са с отклонение от лимитите на потребителя - 100 калории, 10 грама протеини, 20 грама въглехидрати, 10 грама мазнини. ДАВАЙ ВСЕКИ ПЪТ РАЗЛИЧНИ храни, а не еднакви или измислени рецепти.
        Включвай само съществуващи в реалния свят храни в хранителния план. Предоставете точни мерки и точни стойности за калории, протеин, въглехидрати и мазнини за закуска, обяд, вечеря и общо. Включете само реалистични храни за консумация.
        Подсигури рецепти за приготвянето на храните и нужните продукти(съставки) към всяко едно ястие. Направи рецептите и съставките, така че да се получи накрая точното количество, което ще се яде, не повече от това.
        Имената на храните трябва да бъдат адекватно преведени и написани на български език и да са реални ястия за консумация.
        ${
          this.state.userPreferences.Exclude &&
          `Добави всички останали условия към менюто, но се увери, че избягваш стриктно да включваш следните елементи в менюто на храните: ${this.state.userPreferences.Exclude}.
          Съобрази се с начина на приготвяне и рецептите вече като имаш в предвид какво НЕ ТРЯБВА да се включва.`
        }
        Имената на храните трябва да са адекватно преведени и написани, така че да са съществуващи храни.
        Форматирай общата информацията за калориите, протеина, въглехидратите и мазнините по следния начин И ВНИМАВАЙ ТЯ ДА НЕ Е РАЗЛИЧНА ОТ ОБЩАТА СТОЙНОСТ НА КАЛОРИИТЕ, ВЪГЛЕХИДРАТИТЕ, ПРОТЕИНА И МАЗНИНИТЕ НА ЯСТИЯТА: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number,'grams':number}'.
        Форматирай ЦЯЛАТА информация във валиден JSON точно така:
        "'breakfast':{
            'main':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}
          },
          'lunch':{
            'appetizer':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)},
            'main':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)},
            'dessert':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}
          },
          'dinner':{
            'main':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)},
            'dessert':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}
          }`;

    checkTotals = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach((item) => checkTotals(item));
      } else if (typeof obj === "object" && obj !== null) {
        if (obj.hasOwnProperty("totals")) {
          for (let key in obj.totals) {
            if (typeof obj.totals[key] !== "number") {
              throw new Error(
                `Invalid value for ${key} in totals: Expected a number`
              );
            }
          }
        }
        // Recursively check the nested objects
        for (let key in obj) {
          checkTotals(obj[key]);
        }
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
                  role: "user",
                  content: prompt
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
          requestFailed: true,
          isLoading: false
        });
        console.error("Error generating meal plan:", error);
      }
    };

    generatePlanWithGemini = async () => {
      try {
        this.setState({
          isPlanGeneratedWithOpenAI: false,
          isPlanGeneratedWithGemini: true,
          requestFailed: false,
          isLoading: true
        });
        console.log("PROMPT --->", prompt);
        console.log("fetching gemini");
        const response = await fetch(
          "https://nutri-api.noit.eu/geminiGenerateResponse",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
            },
            body: JSON.stringify({ text: prompt })
          }
        );

        const responseData = await response.json();

        console.log("Response from backend:", responseData.aiResponse);

        const stringToRepair = responseData.aiResponse
          .replace(/^```json([\s\S]*?)```$/, "$1")
          .replace(/^```JSON([\s\S]*?)```$/, "$1")
          .replace(/^'|'$/g, "")
          .trim();

        let jsonObject;
        try {
          jsonObject = JSON.parse(stringToRepair);
          checkTotals(jsonObject);
        } catch (parseError) {
          throw new Error("Invalid JSON response from the server");
        }

        console.log("jsonObject: ", jsonObject);

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
        const updatedMealPlanImagesData = {};
        const updatedMealPlan = {};
        for (const mealKey of Object.keys(jsonObject)) {
          if (mealKey !== "totals") {
            const mealAppetizer = jsonObject[mealKey].appetizer;
            const mealMain = jsonObject[mealKey].main;
            const mealDessert = jsonObject[mealKey].dessert;

            // console.log("meal: ", meal);
            // console.log("meal name: ", meal.name);

            //NutriFit: cx=10030740e88c842af, key=AIzaSyDqUez1TEmLSgZAvIaMkWfsq9rSm0kDjIw
            //NutriFit2: cx=258e213112b4b4492, key=AIzaSyArE48NFh1befjjDxpSrJ0eBgQh_OmQ7RA
            //NutriFit3: cx=527000b0fabcc4dab, key=AIzaSyDwqaIBGxmhEc6GVR3lwOVk_-0EpwKvOPA
            async function fetchImage(name) {
              try {
                let response = await fetch(
                  `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyDqUez1TEmLSgZAvIaMkWfsq9rSm0kDjIw&cx=10030740e88c842af&q=${encodeURIComponent(
                    name
                  )}&searchType=image`
                );
                if (response.status === 429) {
                  let response = await fetch(
                    `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyBQMvBehFDpwqhNc9_q-lIfPh8O2xdQ1Mc&cx=258e213112b4b4492&q=${encodeURIComponent(
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

            console.log("imageDessert: ", imageDessert, mealKey);
            // console.log(
            //   `Image Generation Response for ${mealAppetizer.name}: `,
            //   imageAppetizerResponseData.items[0].link
            // );
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

            updatedMealPlanImagesData[mealKey] = {
              appetizer: imageAppetizerResponseData?.items?.[0]?.link || "",
              main: imageMainResponseData.items[0].link,
              dessert: imageDessertResponseData?.items?.[0]?.link || ""
            };

            updatedMealPlan[mealKey] = {
              appetizer: jsonObject[mealKey].appetizer,
              main: jsonObject[mealKey].main,
              dessert: jsonObject[mealKey].dessert
            };
          }
        }

        this.setState({
          mealPlanImages: updatedMealPlanImagesData,
          mealPlan: updatedMealPlan,
          isLoading: false
        });
      } catch (error) {
        this.setState({
          requestFailed: true,
          isLoading: false
        });
        console.error("Error generating meal plan:", error);
      }
    };

    const {
      isLoading,
      requestFailed,
      userPreferences,
      activityLevel,
      dailyCaloryRequirements
    } = this.state;

    const levels = [1, 2, 3, 4, 5, 6];

    console.log("activityLevel: ", activityLevel);

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Card>
            <Text style={styles.title}>Изберете ниво на натовареност:</Text>
            <View style={styles.buttonContainer}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.button,
                    activityLevel === level ? styles.activeButton : null
                  ]}
                  onPress={() => this.setState({ activityLevel: level })}
                >
                  <Text style={styles.buttonText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          <DailyCalorieRequirements
            dailyCaloryRequirementsArray={dailyCaloryRequirements}
            activityLevel={activityLevel}
          />
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
          {requestFailed && <Text>kuro mi, dedov e</Text>}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={generatePlanWithOpenAI}
            >
              <Text style={styles.buttonText}>Generate with OpenAI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={generatePlanWithGemini}
            >
              <Text style={styles.buttonText}>Generate with Gemini</Text>
            </TouchableOpacity>
          </View>

          {Object.keys(this.state.mealPlan).map((mealType, index) => {
            const meal = this.state.mealPlan[mealType];
            const mealImages = this.state.mealPlanImages[mealType]; // Get all images for the meal type

            return (
              <React.Fragment key={index}>
                {/* Map through each item in the meal type */}
                {Object.keys(meal).map((itemType) => {
                  const item = meal[itemType]; // Get the item details
                  const mealImage = mealImages ? mealImages[itemType] : null; // Get the image for the item

                  // Check if item exists before rendering RecipeWidget
                  if (item) {
                    return (
                      <Block style={styles.inputContainer}>
                        <RecipeWidget
                          key={`${mealType}-${itemType}`}
                          image={mealImage}
                          item={item}
                        />
                      </Block>
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
    paddingTop: 20,
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
    marginHorizontal: 20,
    marginBottom: 20
  },
  button: {
    flex: 1,
    backgroundColor: "blue",
    borderRadius: 10,
    justifyContent: "center",
    marginHorizontal: 5
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
  },
  title: {
    lineHeight: 19,
    fontWeight: "400",
    color: nutriTheme.COLORS.HEADER,
    marginTop: 10,
    marginBottom: 10
  }
});

export default MealPlanner;
