import React, { useState } from "react";
import axios from "axios";

function GitHubForm() {
  const [githubUrl, setGithubUrl] = useState("");
  const [language, setLanguage] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = "http://localhost:8000/generate-url/";
    const postData = {
      github_url: githubUrl,
      coding_language: language,
      language_version: "None",
    };

    try {
      const response = await axios.post(apiUrl, postData);

      if (response.status === 200) {
        const result = response.data;
        console.log("Success:", result);
        setGeneratedUrl(result.generated_url);
        setErrorMessage(null);
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setGeneratedUrl(null);
      setErrorMessage(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="githubUrl">GitHub URL:</label>
          <input
            type="text"
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="language">Language:</label>
          <input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
        <button type="submit">Generate URL</button>
      </form>
      {/* Conditionally render the response message */}
      {errorMessage && <div>{errorMessage}</div>}
      {generatedUrl && (
        <div>
          <a
            href={`http://${generatedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            {generatedUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default GitHubForm;
