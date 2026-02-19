instruction to run the project:
1. Clone the repository and navigate to the project directory.
2. Install dependencies for both frontend and backend:
   - For the backend, run `npm install` in the root directory.
3. Start the backend server:
   - Run `npm start` in the root directory to start the Express server on port 3000.
4. Start the frontend development server:
   - Navigate to the `frontend` directory and run `npm run dev` to start the React
   - the proxy is set up in the vite.config.js file to forward API requests to the backend server.
5. Open your browser and navigate to `http://localhost:5173` to view the application. You should see the summery stats employee stats and anomaly detection results displayed on the page.

Few Notes: 
1. I initially used an employee component to show each employees stat, but decided against it for keeping the data cohesive. But left the component for further use. 
2.  I ran out of time to color code the outliers in the frontend customer table, but I have logged the outliers in the console for you to see. I believe this portion of the task had a bit more ambiguity that is best addressed after talking the project PM. Since the threshold for the outliers can easily be adjusted depending on each project data. 