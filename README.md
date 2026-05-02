# AquaGrade AI

AquaGrade AI is an AI-powered fish quality system built during an October 2025 hackathon to address the subjectivity and inconsistency of manual seafood grading. The platform uses a ResNet-based computer vision model to analyze fish images, identify species, assess freshness, and estimate market value in real time. 

It features a modern React + TypeScript frontend integrated with a Flask API and a PostgreSQL (Supabase) backend for seamless end-to-end processing. By delivering fast, objective, and data-driven quality evaluations, AquaGrade AI demonstrates how AI can improve decision-making and efficiency across the fishing and seafood supply chain.

##  Key Features
* **Real-Time Analysis:** Processes images in approximately 0.8 to 1.2 seconds, delivering results that would take human inspectors several minutes to determine.
* **Objective Quality Grading:** Uses a weighted formula based on visual indicators (Eye Clarity, Gill Color, and Skin Condition) to calculate a standardized quality score.
* **Market Valuation:** Provides real-time market valuation estimates based on the predicted species and quality grade.
* **Active Learning Loop:** Features a user feedback system where users can validate or correct predictions, storing this data to continuously retrain and improve the model.
* **Comprehensive Exporting:** Generates shareable PDF reports and CSV data files for supply chain documentation.

##  System Architecture & Tech Stack

**Frontend (React.js)**
* **Stack:** React 18.2.0, TypeScript, Vite, Tailwind CSS, Radix UI.
* **Architecture:** Component-based design featuring `ImageUpload`, `PredictionDisplay`, `DashboardLayout`, and `FishDirectory`.
* **Optimization:** Implements lazy loading and bundle size optimization, managing state primarily via React hooks.

**Backend API (Flask)**
* Exposes core endpoints (`/analyze`, `/batch`, `/history`, `/species`) to handle single and batch image processing.
* Includes a custom `AquaGradeAPI` client class with comprehensive error handling and automatic retry logic for robust frontend-backend communication.

**Database (Supabase / PostgreSQL)**
* **Authentication:** Supabase Auth for secure email/password user login.
* **Schema Design:** Optimized relational structure containing `profiles` (user/vessel data), `fish_predictions` (analysis results), and `fish_species` (reference catalog).
* **Security:** Secured using Row Level Security (RLS) policies.

##  Machine Learning Pipeline

### Model Evolution & Architecture
The system's core relies on a PyTorch-based computer vision model. During development, the architecture evolved through three phases:
1. **Basic CNN:** Failed (60% accuracy) due to gradient vanishing in deep layers.
2. **MobileNet v3:** Improved (85% accuracy) and highly efficient, but lacked representational capacity for fine-grained quality assessments.
3. **ResNet-50 (Final):** Achieved 98.2% accuracy. Residual learning solved the gradient flow issue using identity mappings: $H(x) = F(x) + x$. Transfer learning from ImageNet was utilized to accelerate convergence.

### Training Configuration
* **Loss Function:** Categorical Cross-Entropy to handle the 8-class species identification.
* **Optimizer:** Adam Optimizer (lr=0.001).
* **Regularization:** L2 Weight Decay, 50% Dropout, and Early Stopping (patience=10) to combat persistent overfitting issues encountered during early development.

### The Quality Formula
The AI generates a composite quality score ($Q$) based on three weighted visual features:
* **Eye Clarity (E) [Weight: 0.3]:** Measures corneal transparency and pupil definition.
* **Gill Color (G) [Weight: 0.3]:** Analyzes red pigmentation and tissue integrity.
* **Skin Condition (S) [Weight: 0.4]:** Evaluates mucus layer, scale adherence, and texture.

$$Q = 0.3 \times E + 0.3 \times G + 0.4 \times S$$

*(Note: Variables E, G, and S are scored on a scale of 0 to 100).*

### Performance Metrics
* **Overall Accuracy:** 98.2%
* **Precision (Macro):** 97.8%
* **Recall (Macro):** 98.2%
* **F1-Score (Macro):** 98.0%
* **ROC-AUC:** 99.4%
* **Inference Time:** 0.8s per image
