using System;
using System.Text;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.Collections;

public partial class Data : System.Web.UI.Page
{

    protected void Page_Load(object sender, EventArgs e)
    {

    }

    [WebMethod]
    public static string getDetails(string userId)
    {

        string result = "";
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        string query = "SELECT TOP 1 dbo.UserProfile.UserId FROM dbo.UserProfile WHERE dbo.UserProfile.UserId = @userId";
        SqlDataAdapter da = new SqlDataAdapter(query, con);
        //Parameterize for security reasons - the NVarChar value of -1 represents MAX
        da.SelectCommand.Parameters.Add("@userId", SqlDbType.NVarChar, -1).Value = userId;
        DataTable dt = new DataTable();
        da.Fill(dt);

        if (dt.Rows.Count > 0)
        {
            result = dt.Rows[0][0].ToString();
            return result.ToString();
        }

        else
        {
            result = "NonUser";
            return result.ToString();
        }

    }

    [WebMethod]
    public static string getCourseDetails(string studentID, string courseID)
    {

        string scos = "";
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        string query = "WITH latest AS ( SELECT UserId, PRD_NUM, Date, ScosComplete, ROW_NUMBER() OVER (PARTITION BY UserId ORDER BY Date DESC) AS rownum FROM dbo.Progress WHERE PRD_NUM = @courseID AND UserId = @studentID) SELECT UserId, PRD_NUM, Date, ScosComplete FROM latest WHERE rownum = 1";
        SqlDataAdapter da = new SqlDataAdapter(query, con);
        //Parameterize for security reasons - the value of -1 represents MAX
        da.SelectCommand.Parameters.Add("@courseID", SqlDbType.NVarChar, 255).Value = courseID;
        da.SelectCommand.Parameters.Add("@studentID", SqlDbType.Int, -1).Value = studentID;
        DataTable dt = new DataTable();
        da.Fill(dt);

        if (dt.Rows.Count > 0)
        {
            
            scos = dt.Rows[0][3].ToString();
            return scos.ToString();
        }

        else
        {
            scos = "NA";
            return scos.ToString();
        }

    }

    [WebMethod]
    public static string getFailDetails(string studentID, string courseID)
    {

        string scos = "";
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        string query = "WITH latest AS ( SELECT UserId, PRD_NUM, Date, ScosFailed, ROW_NUMBER() OVER (PARTITION BY UserId ORDER BY Date DESC) AS rownum FROM dbo.Progress WHERE PRD_NUM = @courseID AND UserId = @studentID) SELECT UserId, PRD_NUM, Date, ScosFailed FROM latest WHERE rownum = 1";
        SqlDataAdapter da = new SqlDataAdapter(query, con);
        //Parameterize for security reasons - the value of -1 represents MAX
        da.SelectCommand.Parameters.Add("@courseID", SqlDbType.NVarChar, 255).Value = courseID;
        da.SelectCommand.Parameters.Add("@studentID", SqlDbType.Int, -1).Value = studentID;
        DataTable dt = new DataTable();
        da.Fill(dt);

        if (dt.Rows.Count > 0)
        {

            scos = dt.Rows[0][3].ToString();
            return scos.ToString();
        }

        else
        {
            scos = "NA";
            return scos.ToString();
        }

    }

    [WebMethod]
    public static void submitCourse(string studentID, string courseID, string scosComplete)
    {
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        /*string query = "INSERT INTO Progress_Archive (UserId, PRD_NUM, ScosComplete, ScosFailed, Date) VALUES (@UserId, @PRD_NUM, @Date, @ScosComplete, @ScosFailed)";
        
        SqlCommand cmd = new SqlCommand(query, con);
        cmd.CommandType = System.Data.CommandType.Text;
        cmd.Parameters.AddWithValue("@UserId", studentID);
        cmd.Parameters.AddWithValue("@PRD_NUM", courseID);
        cmd.Parameters.AddWithValue("@Date", DateTime.Now);
        cmd.Parameters.AddWithValue("@ScosComplete", scosComplete);
        cmd.Parameters.AddWithValue("@ScosFailed", "");
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();*/

        string query = "IF (NOT EXISTS(SELECT * FROM Progress WHERE UserId = @UserId AND PRD_NUM = @PRD_NUM)) BEGIN INSERT INTO Progress(UserId, PRD_NUM, Date, ScosComplete, ScosFailed) VALUES(@UserId, @PRD_NUM, @Date, @ScosComplete, @ScosFailed) END ELSE BEGIN UPDATE Progress SET Date = @Date, ScosComplete = @ScosComplete, ScosFailed = @ScosFailed WHERE UserId = @UserId AND PRD_NUM = @PRD_NUM END";
        SqlCommand cmd = new SqlCommand(query, con);
        cmd.CommandType = System.Data.CommandType.Text;
        cmd.Parameters.AddWithValue("@UserId", studentID);
        cmd.Parameters.AddWithValue("@PRD_NUM", courseID);
        cmd.Parameters.AddWithValue("@Date", DateTime.Now);
        cmd.Parameters.AddWithValue("@ScosComplete", scosComplete);
        cmd.Parameters.AddWithValue("@ScosFailed", "");
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();

    }

    [WebMethod]
    public static void submitCourseFail(string studentID, string courseID, string scosComplete, string scosFailed)
    {
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        //string query = "INSERT INTO Progress_Archive VALUES (@UserId, @PRD_NUM, @Date, @ScosComplete, @ScosFailed)";

        /*SqlCommand cmd = new SqlCommand(query, con);
        cmd.CommandType = System.Data.CommandType.Text;
        cmd.Parameters.AddWithValue("@UserId", studentID);
        cmd.Parameters.AddWithValue("@PRD_NUM", courseID);
        cmd.Parameters.AddWithValue("@Date", DateTime.Now);
        cmd.Parameters.AddWithValue("@ScosComplete", scosComplete);
        cmd.Parameters.AddWithValue("@ScosFailed", scosFailed);
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();*/

        string query = "IF (NOT EXISTS(SELECT * FROM Progress WHERE UserId = @UserId AND PRD_NUM = @PRD_NUM)) BEGIN INSERT INTO Progress(UserId, PRD_NUM, Date, ScosComplete, ScosFailed) VALUES(@UserId, @PRD_NUM, @Date, @ScosComplete, @ScosFailed) END ELSE BEGIN UPDATE Progress SET Date = @Date, ScosComplete = @ScosComplete, ScosFailed = @ScosFailed WHERE UserId = @UserId AND PRD_NUM = @PRD_NUM END";
        SqlCommand cmd = new SqlCommand(query, con);
        cmd.CommandType = System.Data.CommandType.Text;
        cmd.Parameters.AddWithValue("@UserId", studentID);
        cmd.Parameters.AddWithValue("@PRD_NUM", courseID);
        cmd.Parameters.AddWithValue("@Date", DateTime.Now);
        cmd.Parameters.AddWithValue("@ScosComplete", scosComplete);
        cmd.Parameters.AddWithValue("@ScosFailed", scosFailed);
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();


    }

    [WebMethod]
    public static void completeCourse(string studentID, string courseID)
    {
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        /*string query = "INSERT INTO Completion_Archive VALUES (@UserId, @PRD_NUM, @CompletionDate)";

        SqlCommand cmd = new SqlCommand(query, con);
        cmd.CommandType = System.Data.CommandType.Text;
        cmd.Parameters.AddWithValue("@UserId", studentID);
        cmd.Parameters.AddWithValue("@PRD_NUM", courseID);
        cmd.Parameters.AddWithValue("@CompletionDate", DateTime.Now);
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();*/

        string query = "IF (NOT EXISTS(SELECT * FROM Completion WHERE UserId = @UserId AND PRD_NUM = @PRD_NUM)) BEGIN INSERT INTO Completion(UserId, PRD_NUM, CompletionDate) VALUES(@UserId, @PRD_NUM, @CompletionDate) END ELSE BEGIN UPDATE Completion SET CompletionDate = @CompletionDate WHERE UserId = @UserId AND PRD_NUM = @PRD_NUM END ";
        SqlCommand cmd = new SqlCommand(query, con);
        cmd.CommandType = System.Data.CommandType.Text;
        cmd.Parameters.AddWithValue("@UserId", studentID);
        cmd.Parameters.AddWithValue("@PRD_NUM", courseID);
        cmd.Parameters.AddWithValue("@CompletionDate", DateTime.Now);
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();

    }



    [WebMethod]
    public static string getCertificateDetails(string studentID)
    {

        string studentInfo = "";
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        string query = "SELECT FirstName, MiddleName, LastName FROM UserProfile WHERE UserId = @studentID";
        SqlDataAdapter da = new SqlDataAdapter(query, con);
        //Parameterize for security reasons - the value of -1 represents MAX
        da.SelectCommand.Parameters.Add("@studentID", SqlDbType.Int, -1).Value = studentID;
        DataTable dt = new DataTable();
        da.Fill(dt);

        if (dt.Rows.Count > 0)
        {

            var info = dt.Rows[0].ItemArray.Select(x => x.ToString()).ToArray();
            studentInfo = string.Join(",",info);
            return studentInfo.ToString();
        }
        else
        {
            studentInfo = "NA";
            return studentInfo.ToString();
        }
    }

    [WebMethod]
    public static string verifyEmail(string userId, string email)
    {
        string result = "";
        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        string query = "SELECT TOP 1 dbo.UserProfile.Email FROM dbo.UserProfile WHERE dbo.UserProfile.UserId = @userId AND dbo.UserProfile.Email = @email";
        SqlDataAdapter da = new SqlDataAdapter(query, con);
        //Parameterize for security reasons - the NVarChar value of -1 represents MAX
        da.SelectCommand.Parameters.Add("@userId", SqlDbType.NVarChar, -1).Value = userId;
        da.SelectCommand.Parameters.Add("@email", SqlDbType.NVarChar, -1).Value = email;
        DataTable dt = new DataTable();
        da.Fill(dt);

        if (dt.Rows.Count > 0)
        {
            result = dt.Rows[0][0].ToString();
            return result.ToString();
        }

        else
        {
            result = "Invalid";
            return result.ToString();
        }

    }    

    [WebMethod]
    public static bool checkObjTable(string courseID, string[] objectiveArray)
    {
        //All we want to do is check the table to see if a row exists for this course and return true or false, no need to write the insert function here.
        bool rowExists = false;
        var list = ((IEnumerable)objectiveArray).Cast<object>().ToList();


        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);

        string query = "SELECT COUNT(*) FROM dbo.Objective WHERE PRD_NUM = @courseID";      
        SqlCommand cmd = new SqlCommand(query, con);

        con.Open();
        cmd.Parameters.AddWithValue("@courseID", courseID);
        int rowCount = Convert.ToInt32( cmd.ExecuteScalar());
        con.Close();

        if(rowCount > 0)
        {
            rowExists = true;
        }
        else
        {
            string valueString = "";
            query = "INSERT INTO dbo.Objective (PRD_NUM";
            for(var i = 1; i < list.Count+1; i++)
            {
                query += ", Objective" + i;
                valueString += "'"+list[i-1].ToString() + "', ";
            }
            valueString = valueString.Remove(valueString.Length - 2, 2);
            query += ") VALUES (" + "'" + courseID + "', " + valueString + ")";
            SqlCommand cmd2 = new SqlCommand(query, con);
            con.Open();
            cmd2.ExecuteNonQuery();
            con.Close();
        }
        return rowExists;
    }

    [WebMethod]
    public static void updatePreSurveyDetails(object studentID, object courseID, object myData, object surveyType)
    {
        string table = "Survey";
        SurveyClass surveyInfo = new JavaScriptSerializer().Deserialize<SurveyClass>(myData.ToString());

        string query = getInsertCommand(table, surveyInfo, studentID.ToString(), courseID.ToString(), surveyType.ToString());
        System.Diagnostics.Debug.WriteLine(query);

        string connStr = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection con = new SqlConnection(connStr);
        SqlCommand cmd = new SqlCommand(query, con);       
        con.Open();
        cmd.ExecuteNonQuery();
        con.Close();          
    }

    private static string getInsertCommand(string table, SurveyClass sI, string userID, string courseID, string surveyType)
    {
        int presurvey = 0;
        int postsurvey = 0;
        string queryInsertInfo = null;
        string queryUpdateInfo = null;
        switch (surveyType)
        {
            case "presurvey":
                presurvey = 1;
                break;
            case "postsurvey":
                postsurvey = 1;
                break;

        }
        //builds query for UPDATE or INSERT based on if the database contains an entry for the Pre/Post Survey
        string queryUpdate = "IF EXISTS ( SELECT * FROM dbo.Survey WHERE UserId = '" + userID + "' AND PRD_NUM = '" + courseID + "' AND  " + surveyType + " = 1) BEGIN UPDATE dbo.Survey SET CompletionDate= '" + DateTime.Now + "', ";
        string queryInsert = "END ELSE BEGIN INSERT INTO dbo." + table + " ( UserId, PRD_NUM, CompletionDate, presurvey, postsurvey, ";
        foreach (var item in sI.surveyData)
        {
            queryInsertInfo += item.name;
            queryInsertInfo += ", ";
            queryUpdateInfo += item.name + "=";
            if (item.value.GetType().Name == "System.Int")
            {
                queryUpdateInfo += item.value;
            }
            else
            {
                queryUpdateInfo += "'";
                queryUpdateInfo += item.value;
                queryUpdateInfo += "'";
            }
            queryUpdateInfo += ", ";
        }

        queryInsertInfo = queryInsertInfo.Remove(queryInsertInfo.Length - 2, 2);
        queryUpdateInfo = queryUpdateInfo.Remove(queryUpdateInfo.Length - 2, 2);
        queryInsertInfo += ") VALUES ( '"+ userID + "', '" + courseID + "', '" + DateTime.Now + "', '" + presurvey + "', '" + postsurvey + "', ";
        foreach(var item in sI.surveyData)
        {
            if(item.value.GetType().Name == "System.Int")
            {
                queryInsertInfo += item.value;
            } else
            {
                queryInsertInfo += "'";
                queryInsertInfo += item.value;
                queryInsertInfo += "'";
            }
            queryInsertInfo += ", ";
        }
        queryInsertInfo = queryInsertInfo.Remove(queryInsertInfo.Length - 2, 2);
        queryInsertInfo += ")";

        string query = queryUpdate + queryUpdateInfo + " WHERE UserId = '" + userID + "' AND PRD_NUM = '" + courseID + "' AND  " + surveyType + " = 1 " + queryInsert + queryInsertInfo + " END";
        return query;
    }

    [Serializable]
    public class SurveyClass
    {
        public List<SurveyData> surveyData { get; set; }
    }

    [Serializable]
    public class SurveyData
    {
        public string name { get; set; }
        public string value { get; set; }
    }
}
 