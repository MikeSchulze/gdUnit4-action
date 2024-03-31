namespace CustomProject.Tests;


using GdUnit4;
using static GdUnit4.Assertions;

[TestSuite]
public class ExampleTest
{
    [TestCase]
    public void success()
    {
        AssertBool(true).IsTrue();
    }

}
