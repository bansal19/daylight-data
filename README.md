
# What 

This is a repo that allows us to visualise all the relevant stakeholders that are involved when it comes to getting a permit for a solar project developer.

# How

We create a new dataset that allows energy project developers (wind/solar/coal/gas) to get access to all stakeholders that are relevant for them to get their project approved. 

The interconnection queue (queue to get connected to the electrical grid for a energy-production project) is at its most packed, with over 8500 projects waiting for approval. *More proposed Wattage is on the interconnection queue right now than exists on the current grid*. 

We want to solve this problem by tackling one of the difficult parts of the process - siting and permitting. 

# Training Datasets

The folder contains versions of datasets we created, with *project_doc_0/1.json* containing specific stakeholders contacted for a few of the projects. 

# Daylight Create DB

The goal of the notebook is to - 
1. Use the [Nepatec dataset](https://huggingface.co/datasets/PolicyAI/NEPATEC1.0) to generate a new dataset. Not just relevant information for every NEPA review but *relevant stakeholders*

2. Provide visualisations so that new project developers can view all relevant stakeholders so they can build proactive relationships in order to expedite siting and permitting. 

