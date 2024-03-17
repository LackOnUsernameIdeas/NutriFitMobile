import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import { Block, theme, Text } from "galio-framework";

import { Card, EmptyCard } from "../components";
import articles from "../constants/articles";
const { width } = Dimensions.get("screen");

const openAIKey =
  "sk-t6ZLFG2tQfoEpyQQq1J(*ENV IS NOT WORKING*)LT3BlbkFJVYKpRlN4VK8dtm8PPb7E";

console.log("openAIKey: ", openAIKey);
class MealPlanner extends React.Component {
  state = {
    isPlanGeneratedWithOpenAI: false,
    isPlanGeneratedWithBgGPT: false,
    mealPlanImages: {},
    mealPlan: {},
    requestFailed: false
  };

  generatePlanWithOpenAI = async () => {
    try {
      this.setState({
        isPlanGeneratedWithOpenAI: true,
        isPlanGeneratedWithBgGPT: false,
        requestFailed: false
      });
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIKey}`
          },
          body: JSON.stringify({
            model: "gpt-4-0125-preview",
            messages: [
              {
                role: "user",
                content: `Здравей!`
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
        mealPlan: data
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
        inputs: `Здравей!`,
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

      // const escapedJSON = responseData.response;
      // const jsonString = escapedJSON.replace(/\\n/g, "").replace(/\\"/g, '"');
      // const fixedjsonString = jsonString.replace(/,\s*]/g, "]");

      // const jsonObject = JSON.parse(fixedjsonString);

      // const mealPlanImagesData = {
      //   breakfast: {
      //     main: ""
      //   },
      //   lunch: {
      //     appetizer: "",
      //     main: "",
      //     dessert: ""
      //   },
      //   dinner: {
      //     main: "",
      //     dessert: ""
      //   }
      // };

      // // Iterate over each meal and make a separate image generation request
      // for (const mealKey of Object.keys(jsonObject)) {
      //   const mealAppetizer = jsonObject[mealKey].appetizer;
      //   const mealMain = jsonObject[mealKey].main;
      //   const mealDessert = jsonObject[mealKey].dessert;

      //   async function fetchImage(name) {
      //     try {
      //       let response = await fetch(
      //         `https://customsearch.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(
      //           name
      //         )}&searchType=image`
      //       );
      //       if (response.status === 429) {
      //         let response = await fetch(
      //           `https://customsearch.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(
      //             name
      //           )}&searchType=image`
      //         );
      //         return response;
      //       } else {
      //         return response;
      //       }
      //     } catch (error) {
      //       console.error("Error fetching image:", error);
      //       return null;
      //     }
      //   }

      //   const imageAppetizer =
      //     mealKey === "lunch" ? await fetchImage(mealAppetizer.name) : null;

      //   const imageMain = await fetchImage(mealMain.name);

      //   const imageDessert =
      //     mealKey === "lunch" || mealKey === "dinner"
      //       ? await fetchImage(mealDessert.name)
      //       : null;

      //   const imageAppetizerResponseData =
      //     imageAppetizer !== null ? await imageAppetizer.json() : null;
      //   const imageMainResponseData = await imageMain.json();
      //   const imageDessertResponseData =
      //     imageDessert !== null ? await imageDessert.json() : null;

      //   if (
      //     imageAppetizerResponseData !== null &&
      //     imageAppetizerResponseData?.items?.[0]?.link
      //   ) {
      //     mealPlanImagesData[mealKey].appetizer =
      //       imageAppetizerResponseData.items[0].link;
      //   }

      //   if (imageMainResponseData?.items?.[0]?.link) {
      //     mealPlanImagesData[mealKey].main =
      //       imageMainResponseData.items[0].link;
      //   }

      //   if (
      //     imageDessertResponseData !== null &&
      //     imageDessertResponseData?.items?.[0]?.link
      //   ) {
      //     mealPlanImagesData[mealKey].dessert =
      //       imageDessertResponseData.items[0].link;
      //   }
      // }

      // this.setState({
      //   mealPlanImages: mealPlanImagesData,
      //   mealPlan: jsonObject
      // });
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

  renderArticles = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        <Block flex>
          <Block flex row>
            <Card
              item={articles[1]}
              style={{ marginRight: theme.SIZES.BASE }}
            />
            <Card item={articles[2]} />
          </Block>
        </Block>
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
      </ScrollView>
    );
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderArticles()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: theme.SIZES.BASE
  },
  button: {
    flex: 1,
    marginHorizontal: theme.SIZES.BASE / 2,
    backgroundColor: "blue",
    borderRadius: 10,
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18
  }
});

export default MealPlanner;
