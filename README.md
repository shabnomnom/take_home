## instruction to run the project:
1. Clone the repository and navigate to the project directory.
2. Install dependencies for both frontend and backend:
   - For the backend, run `npm install` in the root directory.
3. Start the backend server:
   - Run `npm start` in the root directory to start the Express server on port 3000.
4. Start the frontend development server:
   - For the frontend, run `npm install` in the root directory.
   - Navigate to the `frontend` directory and run `npm run dev` to start the React
   - the proxy is set up in the vite.config.js file to forward API requests to the backend server.
5. Open your browser and navigate to `http://localhost:5173` to view the application. You should see the summery stats employee stats and anomaly detection results displayed on the page.

Few Notes: 
1. I initially used an employee component to show each employees stat, but decided against it for keeping the data cohesive. But left the component for further use. 
2.  I ran out of time to color code the outliers in the frontend customer table, but I have logged the outliers in the console for you to see. I believe this portion of the task had a bit more ambiguity that is best addressed after talking the project PM. Since the threshold for the outliers can easily be adjusted depending on each project data. 


## Wish List for further iteration:
1. Add a database to ingest and store the data, I created a quick [PR](https://github.com/shabnomnom/take_home/pull/1) to show how this works. 
2. Move the aggregation step to the backend. This would allow me to leverage the database that I introduced to aggregate in the queries, and I could cache these values in memory. I made another [PR](https://github.com/shabnomnom/take_home/pull/2)
   to demonstrate an example.
3. Fully implement the employee component. This would allow for further implementation of the employee data vis per user click on employee’s record. 
4.  Improve the Anomaly detection endpoint to have the occupation and leveling baseline to normalize the data ONLY per categories and accurately detect the outliers, research and utilize different methodology based on the type of the data and critical project importance [issue #3](https://github.com/shabnomnom/take_home/issues/4Furthermore).
    1. For example,IQR are best utilized for continuous, normally distributed data so employee hours would be a perfect use case for it. 
    2. Simple standard Deviation for the rate, etc.
    3. Regex matching for employee with the same ID and diff name. Guard Rail against data entry mistake.
    4. Near Zero hours - possibly missed hours 
    5. Unusual high average hours per employee - IQR method 
5. Add proper vis tool to demonstrate the outliers. For example, create a bar graph to show the average week earnings for each employee dynamically. [issue #4](https://github.com/shabnomnom/take_home/issues/4).

<img width="703" height="764" alt="Image" src="https://github.com/user-attachments/assets/06ca555c-7eb5-4195-9763-51034a0afbb2" /> 