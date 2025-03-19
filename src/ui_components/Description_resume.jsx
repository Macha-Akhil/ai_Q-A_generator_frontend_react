"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "../components/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Description_resume() {
  const [showQA, setShowQA] = useState(false)
  const [qa, setQa] = useState([])
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null) 
  const [fileName, setFileName] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFileName(selectedFile.name || "")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    if (!file) {
      setMessage("⚠️ Please select a file before uploading.")
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("description", description)
    formData.append("resume", file)

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result?.message ?? "✅ Resume uploaded and analyzed successfully!")
        
        setShowQA(true);
        console.log("result------",result)
        let parsedResult = typeof result === "string" ? JSON.parse(result) : result;
        console.log("Parsed result:", parsedResult);
        console.log("Parsed result.interview_questions:", parsedResult.interview_questions);
        setQa(parsedResult.interview_questions);

      } else {
        throw new Error(`Failed to upload resume: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage(`❌ Error uploading resume: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Job Application</h1>

        {message && (
          <Alert
            className={`mb-6 ${
              typeof message === "string" && message.includes("✅") 
                ? "bg-green-50 border-green-200" 
                : typeof message === "string" && message.includes("⚠️") 
                ? "bg-yellow-50 border-yellow-200" 
                : "bg-red-50 border-red-200"
            }`}
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="description" className="text-lg font-medium">
              Job Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter the job description or requirements..."
              className="mt-2 min-h-[150px]"
            />
          </div>

          <div>
            <Label htmlFor="resume" className="text-lg font-medium">
              Upload Resume
            </Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <p className="text-sm text-gray-500">PDF, DOC, or DOCX up to 5MB</p>
              </div>
              <Input
                id="resume"
                name="resume"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="mt-4 mx-auto max-w-xs"
              />
              {fileName && <p className="mt-2 text-sm text-gray-700">Selected: {fileName}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload Resume"
            )}
          </Button>
        </form>
      </div>

      {showQA && Array.isArray(qa) && qa.length > 0 ? (
  <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
    {qa.map((item, index) => (
      <Card key={index} className="shadow-lg border border-gray-200 rounded-2xl p-4 transition-transform transform hover:scale-105 hover:shadow-xl">
        <CardHeader className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-md">
            {index + 1}
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">{item.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-base leading-relaxed">{item.answer}</p>
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <p className="text-center text-gray-500 mt-4">No questions available.</p>
)}
    </div>
  )
}
