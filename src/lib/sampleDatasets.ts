import type { DataRow } from './dataProcessing';

// Iris dataset (subset - 150 rows)
const irisRaw = [
  [5.1,3.5,1.4,0.2,"setosa"],[4.9,3,1.4,0.2,"setosa"],[4.7,3.2,1.3,0.2,"setosa"],[4.6,3.1,1.5,0.2,"setosa"],
  [5,3.6,1.4,0.2,"setosa"],[5.4,3.9,1.7,0.4,"setosa"],[4.6,3.4,1.4,0.3,"setosa"],[5,3.4,1.5,0.2,"setosa"],
  [4.4,2.9,1.4,0.2,"setosa"],[4.9,3.1,1.5,0.1,"setosa"],[5.4,3.7,1.5,0.2,"setosa"],[4.8,3.4,1.6,0.2,"setosa"],
  [4.8,3,1.4,0.1,"setosa"],[4.3,3,1.1,0.1,"setosa"],[5.8,4,1.2,0.2,"setosa"],[5.7,4.4,1.5,0.4,"setosa"],
  [5.4,3.9,1.3,0.4,"setosa"],[5.1,3.5,1.4,0.3,"setosa"],[5.7,3.8,1.7,0.3,"setosa"],[5.1,3.8,1.5,0.3,"setosa"],
  [5.4,3.4,1.7,0.2,"setosa"],[5.1,3.7,1.5,0.4,"setosa"],[4.6,3.6,1,0.2,"setosa"],[5.1,3.3,1.7,0.5,"setosa"],
  [4.8,3.4,1.9,0.2,"setosa"],[5,3,1.6,0.2,"setosa"],[5,3.4,1.6,0.4,"setosa"],[5.2,3.5,1.5,0.2,"setosa"],
  [5.2,3.4,1.4,0.2,"setosa"],[4.7,3.2,1.6,0.2,"setosa"],[4.8,3.1,1.6,0.2,"setosa"],[5.4,3.4,1.5,0.4,"setosa"],
  [5.2,4.1,1.5,0.1,"setosa"],[5.5,4.2,1.4,0.2,"setosa"],[4.9,3.1,1.5,0.2,"setosa"],[5,3.2,1.2,0.2,"setosa"],
  [5.5,3.5,1.3,0.2,"setosa"],[4.9,3.6,1.4,0.1,"setosa"],[4.4,3,1.3,0.2,"setosa"],[5.1,3.4,1.5,0.2,"setosa"],
  [5,3.5,1.3,0.3,"setosa"],[4.5,2.3,1.3,0.3,"setosa"],[4.4,3.2,1.3,0.2,"setosa"],[5,3.5,1.6,0.6,"setosa"],
  [5.1,3.8,1.9,0.4,"setosa"],[4.8,3,1.4,0.3,"setosa"],[5.1,3.8,1.6,0.2,"setosa"],[4.6,3.2,1.4,0.2,"setosa"],
  [5.3,3.7,1.5,0.2,"setosa"],[5,3.3,1.4,0.2,"setosa"],
  [7,3.2,4.7,1.4,"versicolor"],[6.4,3.2,4.5,1.5,"versicolor"],[6.9,3.1,4.9,1.5,"versicolor"],
  [5.5,2.3,4,1.3,"versicolor"],[6.5,2.8,4.6,1.5,"versicolor"],[5.7,2.8,4.5,1.3,"versicolor"],
  [6.3,3.3,4.7,1.6,"versicolor"],[4.9,2.4,3.3,1,"versicolor"],[6.6,2.9,4.6,1.3,"versicolor"],
  [5.2,2.7,3.9,1.4,"versicolor"],[5,2,3.5,1,"versicolor"],[5.9,3,4.2,1.5,"versicolor"],
  [6,2.2,4,1,"versicolor"],[6.1,2.9,4.7,1.4,"versicolor"],[5.6,2.9,3.6,1.3,"versicolor"],
  [6.7,3.1,4.4,1.4,"versicolor"],[5.6,3,4.5,1.5,"versicolor"],[5.8,2.7,4.1,1,"versicolor"],
  [6.2,2.2,4.5,1.5,"versicolor"],[5.6,2.5,3.9,1.1,"versicolor"],[5.9,3.2,4.8,1.8,"versicolor"],
  [6.1,2.8,4,1.3,"versicolor"],[6.3,2.5,4.9,1.5,"versicolor"],[6.1,2.8,4.7,1.2,"versicolor"],
  [6.4,2.9,4.3,1.3,"versicolor"],[6.6,3,4.4,1.4,"versicolor"],[6.8,2.8,4.8,1.4,"versicolor"],
  [6.7,3,5,1.7,"versicolor"],[6,2.9,4.5,1.5,"versicolor"],[5.7,2.6,3.5,1,"versicolor"],
  [5.5,2.4,3.8,1.1,"versicolor"],[5.5,2.4,3.7,1,"versicolor"],[5.8,2.7,3.9,1.2,"versicolor"],
  [6,2.7,5.1,1.6,"versicolor"],[5.4,3,4.5,1.5,"versicolor"],[6,3.4,4.5,1.6,"versicolor"],
  [6.7,3.1,4.7,1.5,"versicolor"],[6.3,2.3,4.4,1.3,"versicolor"],[5.6,3,4.1,1.3,"versicolor"],
  [5.5,2.5,4,1.3,"versicolor"],[5.5,2.6,4.4,1.2,"versicolor"],[6.1,3,4.6,1.4,"versicolor"],
  [5.8,2.6,4,1.2,"versicolor"],[5,2.3,3.3,1,"versicolor"],[5.6,2.7,4.2,1.3,"versicolor"],
  [5.7,3,4.2,1.2,"versicolor"],[5.7,2.9,4.2,1.3,"versicolor"],[6.2,2.9,4.3,1.3,"versicolor"],
  [5.1,2.5,3,1.1,"versicolor"],[5.7,2.8,4.1,1.3,"versicolor"],
  [6.3,3.3,6,2.5,"virginica"],[5.8,2.7,5.1,1.9,"virginica"],[7.1,3,5.9,2.1,"virginica"],
  [6.3,2.9,5.6,1.8,"virginica"],[6.5,3,5.8,2.2,"virginica"],[7.6,3,6.6,2.1,"virginica"],
  [4.9,2.5,4.5,1.7,"virginica"],[7.3,2.9,6.3,1.8,"virginica"],[6.7,2.5,5.8,1.8,"virginica"],
  [7.2,3.6,6.1,2.5,"virginica"],[6.5,3.2,5.1,2,"virginica"],[6.4,2.7,5.3,1.9,"virginica"],
  [6.8,3,5.5,2.1,"virginica"],[5.7,2.5,5,2,"virginica"],[5.8,2.8,5.1,2.4,"virginica"],
  [6.4,3.2,5.3,2.3,"virginica"],[6.5,3,5.5,1.8,"virginica"],[7.7,3.8,6.7,2.2,"virginica"],
  [7.7,2.6,6.9,2.3,"virginica"],[6,2.2,5,1.5,"virginica"],[6.9,3.2,5.7,2.3,"virginica"],
  [5.6,2.8,4.9,2,"virginica"],[7.7,2.8,6.7,2,"virginica"],[6.3,2.7,4.9,1.8,"virginica"],
  [6.7,3.3,5.7,2.1,"virginica"],[7.2,3.2,6,1.8,"virginica"],[6.2,2.8,4.8,1.8,"virginica"],
  [6.1,3,4.9,1.8,"virginica"],[6.4,2.8,5.6,2.1,"virginica"],[7.2,3,5.8,1.6,"virginica"],
  [7.4,2.8,6.1,1.9,"virginica"],[7.9,3.8,6.4,2,"virginica"],[6.4,2.8,5.6,2.2,"virginica"],
  [6.3,2.8,5.1,1.5,"virginica"],[6.1,2.6,5.6,1.4,"virginica"],[7.7,3,6.1,2.3,"virginica"],
  [6.3,3.4,5.6,2.4,"virginica"],[6.4,3.1,5.5,1.8,"virginica"],[6,3,4.8,1.8,"virginica"],
  [6.9,3.1,5.4,2.1,"virginica"],[6.7,3.1,5.6,2.4,"virginica"],[6.9,3.1,5.1,2.3,"virginica"],
  [5.8,2.7,5.1,1.9,"virginica"],[6.8,3.2,5.9,2.3,"virginica"],[6.7,3.3,5.7,2.5,"virginica"],
  [6.7,3,5.2,2.3,"virginica"],[6.3,2.5,5,1.9,"virginica"],[6.5,3,5.2,2,"virginica"],
  [6.2,3.4,5.4,2.3,"virginica"],[5.9,3,5.1,1.8,"virginica"],
];

export function getIrisDataset(): DataRow[] {
  return irisRaw.map(r => ({
    SepalLength: r[0], SepalWidth: r[1], PetalLength: r[2], PetalWidth: r[3], Species: r[4],
  }));
}

// Small Titanic sample (30 rows for quick demo)
export function getTitanicSample(): DataRow[] {
  return [
    {PassengerId:1,Survived:0,Pclass:3,Name:"Braund, Mr. Owen Harris",Sex:"male",Age:22,SibSp:1,Parch:0,Fare:7.25,Embarked:"S"},
    {PassengerId:2,Survived:1,Pclass:1,Name:"Cumings, Mrs. John Bradley",Sex:"female",Age:38,SibSp:1,Parch:0,Fare:71.28,Embarked:"C"},
    {PassengerId:3,Survived:1,Pclass:3,Name:"Heikkinen, Miss. Laina",Sex:"female",Age:26,SibSp:0,Parch:0,Fare:7.93,Embarked:"S"},
    {PassengerId:4,Survived:1,Pclass:1,Name:"Futrelle, Mrs. Jacques Heath",Sex:"female",Age:35,SibSp:1,Parch:0,Fare:53.1,Embarked:"S"},
    {PassengerId:5,Survived:0,Pclass:3,Name:"Allen, Mr. William Henry",Sex:"male",Age:35,SibSp:0,Parch:0,Fare:8.05,Embarked:"S"},
    {PassengerId:6,Survived:0,Pclass:3,Name:"Moran, Mr. James",Sex:"male",Age:null,SibSp:0,Parch:0,Fare:8.46,Embarked:"Q"},
    {PassengerId:7,Survived:0,Pclass:1,Name:"McCarthy, Mr. Timothy J",Sex:"male",Age:54,SibSp:0,Parch:0,Fare:51.86,Embarked:"S"},
    {PassengerId:8,Survived:0,Pclass:3,Name:"Palsson, Master. Gosta Leonard",Sex:"male",Age:2,SibSp:3,Parch:1,Fare:21.08,Embarked:"S"},
    {PassengerId:9,Survived:1,Pclass:3,Name:"Johnson, Mrs. Oscar W",Sex:"female",Age:27,SibSp:0,Parch:2,Fare:11.13,Embarked:"S"},
    {PassengerId:10,Survived:1,Pclass:2,Name:"Nasser, Mrs. Nicholas",Sex:"female",Age:14,SibSp:1,Parch:0,Fare:30.07,Embarked:"C"},
    {PassengerId:11,Survived:1,Pclass:3,Name:"Sandstrom, Miss. Marguerite Rut",Sex:"female",Age:4,SibSp:1,Parch:1,Fare:16.7,Embarked:"S"},
    {PassengerId:12,Survived:1,Pclass:1,Name:"Bonnell, Miss. Elizabeth",Sex:"female",Age:58,SibSp:0,Parch:0,Fare:26.55,Embarked:"S"},
    {PassengerId:13,Survived:0,Pclass:3,Name:"Saundercock, Mr. William Henry",Sex:"male",Age:20,SibSp:0,Parch:0,Fare:8.05,Embarked:"S"},
    {PassengerId:14,Survived:0,Pclass:3,Name:"Andersson, Mr. Anders Johan",Sex:"male",Age:39,SibSp:1,Parch:5,Fare:31.28,Embarked:"S"},
    {PassengerId:15,Survived:0,Pclass:3,Name:"Vestrom, Miss. Hulda Amanda A",Sex:"female",Age:14,SibSp:0,Parch:0,Fare:7.85,Embarked:"S"},
    {PassengerId:16,Survived:1,Pclass:2,Name:"Hewlett, Mrs. (Mary D Kingcome)",Sex:"female",Age:55,SibSp:0,Parch:0,Fare:16,Embarked:"S"},
    {PassengerId:17,Survived:0,Pclass:3,Name:"Rice, Master. Eugene",Sex:"male",Age:2,SibSp:4,Parch:1,Fare:29.13,Embarked:"Q"},
    {PassengerId:18,Survived:1,Pclass:2,Name:"Williams, Mr. Charles Eugene",Sex:"male",Age:null,SibSp:0,Parch:0,Fare:13,Embarked:"S"},
    {PassengerId:19,Survived:0,Pclass:3,Name:"Vander Planke, Mrs. Julius",Sex:"female",Age:31,SibSp:1,Parch:0,Fare:18,Embarked:"S"},
    {PassengerId:20,Survived:1,Pclass:3,Name:"Masselmani, Mrs. Fatima",Sex:"female",Age:null,SibSp:0,Parch:0,Fare:7.23,Embarked:"C"},
    {PassengerId:21,Survived:0,Pclass:2,Name:"Fynney, Mr. Joseph J",Sex:"male",Age:35,SibSp:0,Parch:0,Fare:26,Embarked:"S"},
    {PassengerId:22,Survived:1,Pclass:2,Name:"Beesley, Mr. Lawrence",Sex:"male",Age:34,SibSp:0,Parch:0,Fare:13,Embarked:"S"},
    {PassengerId:23,Survived:1,Pclass:3,Name:"McGowan, Miss. Anna",Sex:"female",Age:15,SibSp:0,Parch:0,Fare:8.03,Embarked:"Q"},
    {PassengerId:24,Survived:1,Pclass:1,Name:"Sloper, Mr. William Thompson",Sex:"male",Age:28,SibSp:0,Parch:0,Fare:35.5,Embarked:"S"},
    {PassengerId:25,Survived:0,Pclass:3,Name:"Palsson, Miss. Torborg Danira",Sex:"female",Age:8,SibSp:3,Parch:1,Fare:21.08,Embarked:"S"},
    {PassengerId:26,Survived:1,Pclass:3,Name:"Asplund, Mrs. Carl Oscar",Sex:"female",Age:38,SibSp:1,Parch:5,Fare:31.39,Embarked:"S"},
    {PassengerId:27,Survived:0,Pclass:3,Name:"Emir, Mr. Farred Chehab",Sex:"male",Age:null,SibSp:0,Parch:0,Fare:7.23,Embarked:"C"},
    {PassengerId:28,Survived:0,Pclass:1,Name:"Fortune, Mr. Charles Alexander",Sex:"male",Age:19,SibSp:3,Parch:2,Fare:263,Embarked:"S"},
    {PassengerId:29,Survived:1,Pclass:3,Name:"O'Dwyer, Miss. Ellen",Sex:"female",Age:null,SibSp:0,Parch:0,Fare:7.88,Embarked:"Q"},
    {PassengerId:30,Survived:0,Pclass:3,Name:"Todoroff, Mr. Lalio",Sex:"male",Age:null,SibSp:0,Parch:0,Fare:7.9,Embarked:"S"},
  ];
}

export const SAMPLE_DATASETS = [
  { id: 'iris', name: 'Iris Flower Dataset', description: '150 samples, 4 numeric features, 3 species classes. Classic ML dataset.', rows: 150, cols: 5, loader: getIrisDataset },
  { id: 'titanic', name: 'Titanic Passengers (Sample)', description: '30 passengers with survival, class, age, fare. Contains missing values.', rows: 30, cols: 10, loader: getTitanicSample },
];
