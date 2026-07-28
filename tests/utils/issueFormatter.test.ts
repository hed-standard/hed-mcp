import { formatIssues, formatIssue, FormattedIssue, separateIssuesBySeverity } from '../../src/utils/issueFormatter';
import { Issue, BidsHedIssue, IssueError } from 'hed-validator';

describe('issueFormatter', () => {
    describe('formatIssues', () => {
        it('should format a string issue correctly', () => {
            const issues = ['This is a test error'];
            const expected: FormattedIssue[] = [
                {
                    code: 'INTERNAL_ERROR',
                    detailedCode: 'INTERNAL_ERROR',
                    severity: 'error',
                    message: 'This is a test error',
                    column: '',
                    line: '',
                    location: '',
                },
            ];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });

        it('should format a HED Issue object correctly', () => {
            const issue = new Issue('illegalSidecarData', 'SIDECAR_INVALID', 'error', {'sidecarKey': 'event_codes' });
            const issues: Issue[] = [issue];
            const expected: FormattedIssue[] = [
                {
                    code: 'SIDECAR_INVALID',
                    detailedCode: 'illegalSidecarData',
                    severity: 'error',
                    message: 'ERROR: [SIDECAR_INVALID] The data associated with sidecar key \"event_codes\" cannot be parsed. Sidecar key: \"event_codes\". (For more information on this HED error, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#sidecar-invalid.)',
                    column: 'event_codes',
                    line: '',
                    location: '',
                },
            ];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });

        it('should format a BidsHedIssue object correctly', () => {
            const hedIssue = new Issue('INTERNAL_1', 'HED_CODE_1', 'warning',  {
                tsvLine: 5,
                sidecarKey: 'SidecarKey',
                filePath: '/path/to/bids/file',
            });
            const bidsIssue = new BidsHedIssue(hedIssue, { path: '/path/to/bids/file' });
           
            const expected: FormattedIssue =
                {
                    code: 'HED_CODE_1',
                    detailedCode: 'INTERNAL_1',
                    severity: 'warning',
                    message: 'WARNING: [HED_CODE_1] Unknown HED error \"INTERNAL_1\" - parameters: \"{\"internalCode\":\"INTERNAL_1\",\"parameters\":\"{\\\"tsvLine\\\":\\\"5\\\",\\\"sidecarKey\\\":\\\"SidecarKey\\\",\\\"filePath\\\":\\\"/path/to/bids/file\\\"}\"}\". Sidecar key: \"SidecarKey\". TSV line: \"5\". File path: \"/path/to/bids/file\". (For more information on this HED warning, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#hed-code-1.)',
                    column: 'SidecarKey',
                    line: '5',
                    location: '/path/to/bids/file',
                };

            const actual = formatIssue(bidsIssue);
            expect(actual).toEqual(expected);
        });

        it('should format a HED IssueError object correctly', () => {
      
            try {
                IssueError.generateAndThrow('invalidPlaceholderContext', {string: 'Label/#'});
                fail('IssueError.generateAndThrow should have thrown an error but did not.');
            } catch (e) {
                expect(e).toBeInstanceOf(IssueError);
                const issues = [e];
                const expected: FormattedIssue[] = [
                    {
                        code: 'PLACEHOLDER_INVALID',
                        detailedCode: 'invalidPlaceholderContext',
                        severity: 'error',
                        message: 'ERROR: [PLACEHOLDER_INVALID] "Label/#" has "#" placeholders, which are not allowed in this context.  (For more information on this HED error, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#placeholder-invalid.)',
                        column: '',
                        line: '',
                        location: '',
                    },
                ];
                const actual = formatIssues(issues);
                expect(actual).toEqual(expected);
            }
        });

        it('should format a generic Error object correctly', () => {
            const error = new Error('This is a generic error message');
            const issues = [error];
            const expected: FormattedIssue[] = [
                {
                    code: 'INTERNAL_ERROR',
                    detailedCode: 'INTERNAL_ERROR',
                    severity: 'error',
                    message: 'This is a generic error message',
                    column: '',
                    line: '',
                    location: '',
                },
            ];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });

        it('should format a plain object issue correctly', () => {
            const issues = [
                {
                    message: 'Plain object message',
                    severity: 'warning',
                    code: 'PLAIN_CODE',
                    lineNumber: 15,
                    filePath: '/path/to/plain.txt',
                },
            ];
            const expected: FormattedIssue[] = [
                {
                    code: 'PLAIN_CODE',
                    detailedCode: '',
                    severity: 'warning',
                    message: 'Plain object message',
                    column: '',
                    line: '15',
                    location: '/path/to/plain.txt',
                },
            ];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });

        it('should handle unknown issue types by converting them to a string', () => {
            const issues = [12345, null, undefined];
            const expected: FormattedIssue[] = [
                {
                    code: 'INTERNAL_ERROR',
                    detailedCode: 'INTERNAL_ERROR',
                    severity: 'error',
                    message: '12345',
                    column: '',
                    line: '',
                    location: '',
                },
                {
                    code: 'INTERNAL_ERROR',
                    detailedCode: 'INTERNAL_ERROR',
                    severity: 'error',
                    message: 'null',
                    column: '',
                    line: '',
                    location: '',
                },
                {
                    code: 'INTERNAL_ERROR',
                    detailedCode: 'INTERNAL_ERROR',
                    severity: 'error',
                    message: 'undefined',
                    column: '',
                    line: '',
                    location: '',
                },
            ];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });

        it('should handle an array with a mix of issue types', () => {
            const hedIssue = new Issue('A HED issue', 'HED_CODE_MIXED', 'warning', {tsvLine: 20});

            const issues = [
                'A string error',
                hedIssue,
                {
                    message: 'A plain object error',
                    code: 'PLAIN_MIXED',
                },
            ];
            const expected: FormattedIssue[] = [
                {
                    code: 'INTERNAL_ERROR',
                    detailedCode: 'INTERNAL_ERROR',
                    severity: 'error',
                    message: 'A string error',
                    column: '',
                    line: '',
                    location: '',
                },
                {
                    code: 'HED_CODE_MIXED',
                    detailedCode: 'A HED issue',
                    severity: 'warning',
                    message: 'WARNING: [HED_CODE_MIXED] Unknown HED error \"A HED issue\" - parameters: \"{\"internalCode\":\"A HED issue\",\"parameters\":\"{\\\"tsvLine\\\":\\\"20\\\"}\"}\". TSV line: \"20\". (For more information on this HED warning, see https://hed-specification.readthedocs.io/en/latest/Appendix_B.html#hed-code-mixed.)',
                    column: '',
                    line: '20',
                    location: '',
                },
                {
                    code: 'PLAIN_MIXED',
                    detailedCode: '',
                    severity: 'error',
                    message: 'A plain object error',
                    column: '',
                    line: '',
                    location: '',
                },
            ];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });

        it('should handle empty input array', () => {
            const issues: any[] = [];
            const expected: FormattedIssue[] = [];
            const actual = formatIssues(issues);
            expect(actual).toEqual(expected);
        });
    });

    describe('separateIssuesBySeverity', () => {
        it('should separate errors from other issues', () => {
            const issues: FormattedIssue[] = [
                {
                    code: 'ERROR_CODE',
                    detailedCode: 'ERROR_DETAILED',
                    severity: 'error',
                    message: 'This is an error',
                    column: '',
                    line: '',
                    location: ''
                },
                {
                    code: 'WARNING_CODE',
                    detailedCode: 'WARNING_DETAILED',
                    severity: 'warning',
                    message: 'This is a warning',
                    column: '',
                    line: '',
                    location: ''
                },
                {
                    code: 'INFO_CODE',
                    detailedCode: 'INFO_DETAILED',
                    severity: 'info',
                    message: 'This is info',
                    column: '',
                    line: '',
                    location: ''
                },
                {
                    code: 'ANOTHER_ERROR',
                    detailedCode: 'ANOTHER_ERROR_DETAILED',
                    severity: 'error',
                    message: 'This is another error',
                    column: '',
                    line: '',
                    location: ''
                }
            ];

            const result = separateIssuesBySeverity(issues);

            expect(result.errors).toHaveLength(2);
            expect(result.others).toHaveLength(2);
            
            expect(result.errors[0].severity).toBe('error');
            expect(result.errors[1].severity).toBe('error');
            
            expect(result.others[0].severity).toBe('warning');
            expect(result.others[1].severity).toBe('info');
        });

        it('should handle all errors', () => {
            const issues: FormattedIssue[] = [
                {
                    code: 'ERROR1',
                    detailedCode: 'ERROR1_DETAILED',
                    severity: 'error',
                    message: 'Error 1',
                    column: '',
                    line: '',
                    location: ''
                },
                {
                    code: 'ERROR2',
                    detailedCode: 'ERROR2_DETAILED',
                    severity: 'error',
                    message: 'Error 2',
                    column: '',
                    line: '',
                    location: ''
                }
            ];

            const result = separateIssuesBySeverity(issues);

            expect(result.errors).toHaveLength(2);
            expect(result.others).toHaveLength(0);
        });

        it('should handle no errors', () => {
            const issues: FormattedIssue[] = [
                {
                    code: 'WARNING_CODE',
                    detailedCode: 'WARNING_DETAILED',
                    severity: 'warning',
                    message: 'This is a warning',
                    column: '',
                    line: '',
                    location: ''
                },
                {
                    code: 'INFO_CODE',
                    detailedCode: 'INFO_DETAILED',
                    severity: 'info',
                    message: 'This is info',
                    column: '',
                    line: '',
                    location: ''
                }
            ];

            const result = separateIssuesBySeverity(issues);

            expect(result.errors).toHaveLength(0);
            expect(result.others).toHaveLength(2);
        });

        it('should handle empty array', () => {
            const issues: FormattedIssue[] = [];
            const result = separateIssuesBySeverity(issues);

            expect(result.errors).toHaveLength(0);
            expect(result.others).toHaveLength(0);
        });
    });
});