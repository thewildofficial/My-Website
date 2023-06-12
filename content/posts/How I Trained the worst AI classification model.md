---
author: "Aban Hasan"
date: 2023-06-12
title: How I Trained the Worst AI Classification Model
draft: false
katex: true
description: In my quest to learn how to leverage AI and ML to propel me into the zenith of technology prowess, I find that i'm making some wierd mistakes. This is my Analysis of that.
tags:AI, ML, CS
---

AI has certainly been a term that has been blowing up in the last few months.Tools like ChatGPT and the image generators like Midjourney and Stable Diffusion has taken the world by storms (funnily enough, pretty as I predicted)

In the year 2020, when all of us were stuck indoors all day, I was bored out of my mind and ran into OpenAI's novel text generation project, GPT-3.

Immediately I saw the potential.
In fact, a business idea popped into my head.

GPT-3 at that point could actually write pretty convincing essays and idea explaination (the example case, if i remember correctly, was _describe quantum physics to a 5 year old_).
I wanted to create a tool students could use to quickly answer factual/language based questions, which in retrospect was a ChatGPT-eque clone (image linked below)

 
 --- 
 
 ![lizard brain](/images/oldgpt.png)
 
 --- 

 From this moment onwards, I knew that I'd dedicate 10,20 years of my life to mastering machines/AI
 A computer never has to sleep.
 It just needs electricity. 
 In fact, like the famous Warren Buffet quote **it can make you money while you sleep**

Time passed, I got distracted by the menialities of life,
but here I am, back again!


## The titanic Dataset
the website kaggle.com has a very famous dataset called the **Titanic Survival Dataset**, showing different features and characteristics held by passengers of the cruiseship the HMS titanic, along with the binary value of wether they survived or died.
Ever since i started dipping my toes into machine learning, I've tried playing around with this dataset but never knew what to do past just importing it into a pandas dataframe.
But after investing considerable time into learning the deep learning framework *pytorch*, I tried my hands.

This is my first serious attempt at deep learning!


you can find the jupyter notebook [here.](https://github.com/thewildofficial/pytorch-notebooks/blob/main/titanic.ipynb)


## Analyzing the Code

In this section, I will analyze the code provided and explain my thought process for each block.

### Importing Libraries and Dataset

```python
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np

# Download the Titanic dataset
url = 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv'
titanic_dataset = pd.read_csv(url).dropna()

titanic_dataset
```

In this block, the necessary libraries are imported: torch for deep learning operations, pandas for data manipulation, and numpy for numerical operations. The Titanic dataset is then downloaded from a provided URL and stored in the titanic_dataset variable. It is worth noting that missing values are dropped using the dropna() method.
Defining the Device

```python

device = "cuda" if torch.cuda.is_available() else "cpu"
```

This block determines whether a GPU (CUDA) is available. If a GPU is available, the device is set to "cuda", otherwise, it is set to "cpu". This device selection will be used later to move tensors to the appropriate device for computation.
Preparing the Data
```python

features = ["Pclass", "Sex", "Age", "Parch", "SibSp", "Fare", "Embarked"]
X = titanic_dataset[features]
y = titanic_dataset["Survived"]
X['Sex'] = X['Sex'].replace({'male': 0, 'female': 1})
X["Embarked"] = X["Embarked"].replace({"C": 0, "S": 1, "Q": 2})

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.7, random_state=69)
X_train
```
This block prepares the data for training. The features of interest are selected and stored in the X variable, while the target variable "Survived" is stored in the y variable. Next, the categorical variables "Sex" and "Embarked" are encoded into numeric values (0 or 1) for ease of processing. The data is then split into training and testing sets using the train_test_split function from sklearn.model_selection, with a test size of 0.7 (70% of the data is used for testing).
Converting to Tensors
```python

# converting to tensors
X_train = torch.tensor(X_train.values.astype(np.float32)).to(device)
X_test = torch.tensor(X_test.values.astype(np.float32)).to(device)
y_train = torch.tensor(y_train.values.astype(np.float32)).to(device)
y_test = torch.tensor(y_test.values.astype(np.float32)).to(device)

X_train = X_train.to(torch.float32)
X_test = X_test.to(torch.float32)
y_train = y_train.to(torch.float32)
y_test = y_test.to(torch.float32)
```
In this block, the data is converted to PyTorch tensors and moved to the selected device (GPU or CPU). The torch.tensor function is used to convert the pandas DataFrame values to tensors, and astype(np.float32) is used to ensure the data type is float32. Additionally, the data type of the tensors is explicitly set to torch.float32 using the to method. This step is necessary for correct tensor operations and compatibility with the defined model.
Defining the Model

```python

model = torch.nn.Sequential(
    torch.nn.Linear(7, 10),
    torch.nn.ReLU(),
    torch.nn.Linear(10, 10),
    torch.nn.ReLU(),
    torch.nn.Linear(10, 1),  # Single output unit
    torch.nn.Sigmoid()  # Apply sigmoid activation
)
```
Here, a sequential model is defined using torch.nn.Sequential. The model architecture consists of three linear layers with ReLU activation functions in between, followed by a sigmoid activation function. The first linear layer takes an input of size 7 (corresponding to the number of features), outputs to a hidden layer of size 10, then goes through another hidden layer of size 10 before the final output layer with a single unit.
Model Training

```python

from torch import nn

model = model.to(device)
loss_fn = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.005)

# calculate accuracy
def accuracy_fn(y_true, y_pred):
    correct = torch.eq(y_true, y_pred).sum().item()
    acc = (correct / len(y_pred)) * 100
    return acc

epochs = 200
for epoch in range(epochs):
    preds = model.forward(X_train).flatten()
    loss = loss_fn(preds, y_train)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    print(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}, Accuracy: {accuracy_fn(y_train, preds.round())}%")
```
This block performs the training of the defined model. The model is moved to the selected device using the to method. The binary cross-entropy loss (BCELoss) is chosen as the loss function for this binary classification problem. The Adam optimizer is used to update the model parameters with a learning rate of 0.005.

The training loop runs for the specified number of epochs. In each epoch, the model predictions are computed using the training data (X_train), and the loss is calculated based on these predictions and the ground truth labels (y_train). The optimizer's gradients are then reset (zero_grad), and the loss is backpropagated through the model (backward) to compute the gradients. Finally, the optimizer's step function is called to update the model's parameters based on the computed gradients.

The loss value and the accuracy (calculated using the accuracy_fn function) are printed for each epoch.
Final Accuracy

```python
my_final_accuracy = 72.09302325581395
```
The final accuracy achieved after training the model is calculated and stored in the my_final_accuracy variable. It is noted that the accuracy obtained is relatively low.

In this blog post, I shared my journey and thought process while training a deep learning model on the Titanic Survival Dataset. I discussed each code block and explained my reasoning for the choices made. Although my final accuracy was disappointingly low at 72.09%, this experience has provided me with valuable insights and motivated me to further explore the field of AI and machine learning.

Stay tuned for future blog posts as I continue my quest to improve my AI skills and train better models!