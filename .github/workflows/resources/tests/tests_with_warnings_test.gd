extends GdUnitTestSuite


## example to report as success
func test_success() -> void:
	var node: Node = auto_free(Node.new())
	assert_that(node).is_not_null()


## example to report as warning
func test_warning_orphan() -> void:
	var node := Node.new()
	assert_that(node).is_not_null()
