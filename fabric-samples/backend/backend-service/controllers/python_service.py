import os
import flwr as fl
import tensorflow as tf
from sklearn import linear_model # for handling missing values
import h5py as h5 #To save model weights
from keras.models import Sequential, model_from_json # to create and save model
from keras.utils import plot_model
from keras.layers import Dense
import numpy as np
from sklearn import preprocessing
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
from matplotlib import rcParams
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix


home_directory = os.path.expanduser('~')
csv_file = os.path.join(home_directory, 'fabric-federated-ml-client', 'fabric-samples', 'backend', 'backend-service', 'retrieved_data_set.csv')
data = pd.read_csv(csv_file)
a = data.isnull().sum()
b = a.sort_values(ascending=False)

scaler = StandardScaler()
train_data = data.to_numpy()
train_data[:, :8] = scaler.fit_transform(train_data[:, :8])

X = train_data[:, [0, 1, 5, 7]]
Y = pd.get_dummies(train_data[:, 8])
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.4, random_state=10)
model = Sequential()
model.add(Dense(12, input_dim=X_train.shape[1], activation='relu'))
model.add(Dense(10, activation='relu'))
model.add(Dense(2, activation='softmax'))
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
model.summary()
checkpoint_path = "training_1/blk-cp.weights.h5"
checkpoint_dir = os.path.dirname(checkpoint_path)

# Create a callback that saves the model's weights
cp_callback = tf.keras.callbacks.ModelCheckpoint(filepath=checkpoint_path,save_weights_only=True,verbose=1)

class CifarClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return model.get_weights()

    def fit(self, parameters, config):
        model.set_weights(parameters)
        model.fit(X_train, Y_train, epochs=1, batch_size=32, steps_per_epoch=3, 
                  callbacks=[cp_callback])
        return model.get_weights(), len(X_train), {}

    def evaluate(self, parameters, config):
        model.set_weights(parameters)
        loss, accuracy = model.evaluate(X_test, Y_test)
        print("%s: %.2f%%" % (loss, accuracy))
        return loss, len(X_test), {"accuracy": float(accuracy)}
    
fl.client.start_client(server_address="172.16.10.220:8080", client=CifarClient().to_client())
