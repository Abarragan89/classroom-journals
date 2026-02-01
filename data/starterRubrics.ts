import { StarterRubric } from "@/types";

export const starterRubrics: StarterRubric[] = [
    {
        title: "Personal Narrative",
        rubricData: [
            {
                name: "Introduction",
                maxScore: 4,
                criteria: [
                    { description: "No clear introduction or the topic is confusing or missing", score: 1 },
                    { description: "Attempts to introduce the experience, but lacks clarity or context", score: 2 },
                    { description: "Clearly introduces the experience, though engagement may be limited", score: 3 },
                    { description: "Engaging and clear introduction that provides strong context for the narrative", score: 4 }
                ]
            },
            {
                name: "Organization and Structure",
                maxScore: 4,
                criteria: [
                    { description: "Events are disorganized or difficult to follow", score: 1 },
                    { description: "Some organization is present, but sequence may be unclear or inconsistent", score: 2 },
                    { description: "Events are mostly logical and organized with a clear sequence", score: 3 },
                    { description: "Events are logically organized and flow smoothly from beginning to end", score: 4 }
                ]
            },
            {
                name: "Development of Events",
                maxScore: 4,
                criteria: [
                    { description: "Events are vague, minimal, or lack meaningful detail", score: 1 },
                    { description: "Some events are described, but details are limited or uneven", score: 2 },
                    { description: "Events are described with adequate detail that supports the narrative", score: 3 },
                    { description: "Events are well-developed with specific and relevant details that enhance the narrative", score: 4 }
                ]
            },
            {
                name: "Use of Language and Voice",
                maxScore: 4,
                criteria: [
                    { description: "Language is very basic or unclear and does not convey a personal voice", score: 1 },
                    { description: "Language shows some attempt at voice, but is inconsistent or limited", score: 2 },
                    { description: "Language is appropriate and shows a clear personal voice", score: 3 },
                    { description: "Language is purposeful and expressive, clearly conveying a strong personal voice", score: 4 }
                ]
            },
            {
                name: "Conclusion",
                maxScore: 4,
                criteria: [
                    { description: "Conclusion is missing or does not relate to the narrative", score: 1 },
                    { description: "Conclusion is present but weak or only loosely connected to the events", score: 2 },
                    { description: "Conclusion connects to the narrative and provides some sense of closure", score: 3 },
                    { description: "Clear and thoughtful conclusion that provides meaningful closure to the narrative", score: 4 }
                ]
            },
            {
                name: "Conventions",
                maxScore: 4,
                criteria: [
                    { description: "Frequent errors in grammar, spelling, or punctuation interfere with understanding", score: 1 },
                    { description: "Some errors are present and occasionally affect clarity", score: 2 },
                    { description: "Minor errors are present but do not significantly affect understanding", score: 3 },
                    { description: "Grammar, spelling, and punctuation are mostly correct and enhance clarity", score: 4 }
                ]
            }
        ]
    },
    {
        title: "Informative Essay",
        rubricData: [
            {
                name: "Introduction",
                maxScore: 4,
                criteria: [
                    {
                        description: "Introduction is missing or the topic is unclear",
                        score: 1
                    },
                    {
                        description: "Attempts to introduce the topic, but focus or clarity is limited",
                        score: 2
                    },
                    {
                        description: "Clearly introduces the topic, though the focus may be general",
                        score: 3
                    },
                    {
                        description: "Clearly and effectively introduces the topic with a strong, focused context",
                        score: 4
                    }
                ]
            },
            {
                name: "Organization and Structure",
                maxScore: 4,
                criteria: [
                    {
                        description: "Information is disorganized or difficult to follow",
                        score: 1
                    },
                    {
                        description: "Some organizational structure is present, but ideas may be uneven or unclear",
                        score: 2
                    },
                    {
                        description: "Information is mostly well-organized with a logical progression of ideas",
                        score: 3
                    },
                    {
                        description: "Information is clearly organized with a logical and effective structure",
                        score: 4
                    }
                ]
            },
            {
                name: "Development of Ideas",
                maxScore: 4,
                criteria: [
                    {
                        description: "Ideas are minimal, inaccurate, or lack sufficient explanation",
                        score: 1
                    },
                    {
                        description: "Some relevant information is included, but explanations may be limited or unclear",
                        score: 2
                    },
                    {
                        description: "Ideas are explained with adequate detail and generally accurate information",
                        score: 3
                    },
                    {
                        description: "Ideas are thoroughly developed with clear, accurate, and relevant explanations",
                        score: 4
                    }
                ]
            },
            {
                name: "Use of Evidence and Details",
                maxScore: 4,
                criteria: [
                    {
                        description: "Little to no evidence or details are provided to support ideas",
                        score: 1
                    },
                    {
                        description: "Some details or examples are provided, but support may be weak or inconsistent",
                        score: 2
                    },
                    {
                        description: "Relevant details and examples are used to support most ideas",
                        score: 3
                    },
                    {
                        description: "Strong, relevant details and examples effectively support all ideas",
                        score: 4
                    }
                ]
            },
            {
                name: "Use of Language and Tone",
                maxScore: 4,
                criteria: [
                    {
                        description: "Language is unclear or informal and does not suit an informative purpose",
                        score: 1
                    },
                    {
                        description: "Language is somewhat appropriate, but tone may be inconsistent or vague",
                        score: 2
                    },
                    {
                        description: "Language is appropriate and generally maintains an informative tone",
                        score: 3
                    },
                    {
                        description: "Language is clear, precise, and consistently maintains an informative tone",
                        score: 4
                    }
                ]
            },
            {
                name: "Conclusion",
                maxScore: 4,
                criteria: [
                    {
                        description: "Conclusion is missing or does not relate to the information presented",
                        score: 1
                    },
                    {
                        description: "Conclusion is present but weak or loosely connected to the main ideas",
                        score: 2
                    },
                    {
                        description: "Conclusion summarizes the information and provides a sense of closure",
                        score: 3
                    },
                    {
                        description: "Clear and effective conclusion that reinforces the main ideas",
                        score: 4
                    }
                ]
            },
            {
                name: "Conventions",
                maxScore: 4,
                criteria: [
                    {
                        description: "Frequent errors in grammar, spelling, or punctuation interfere with understanding",
                        score: 1
                    },
                    {
                        description: "Some errors are present and occasionally affect clarity",
                        score: 2
                    },
                    {
                        description: "Minor errors are present but do not significantly affect understanding",
                        score: 3
                    },
                    {
                        description: "Grammar, spelling, and punctuation are mostly correct and enhance clarity",
                        score: 4
                    }
                ]
            }
        ]
    },
    {
        title: "Persuasive Essay",
        rubricData: [
            {
                name: "Introduction",
                maxScore: 4,
                criteria: [
                    {
                        description: "Introduction is missing or the position is unclear",
                        score: 1
                    },
                    {
                        description: "Attempts to introduce the topic or position, but clarity or focus is limited",
                        score: 2
                    },
                    {
                        description: "Clearly introduces the topic and states a position",
                        score: 3
                    },
                    {
                        description: "Clearly and effectively introduces the topic with a strong, focused position",
                        score: 4
                    }
                ]
            },
            {
                name: "Organization and Structure",
                maxScore: 4,
                criteria: [
                    {
                        description: "Ideas are disorganized or difficult to follow",
                        score: 1
                    },
                    {
                        description: "Some organizational structure is present, but ideas may be uneven or unclear",
                        score: 2
                    },
                    {
                        description: "Ideas are mostly well-organized with a logical progression",
                        score: 3
                    },
                    {
                        description: "Ideas are clearly organized and build logically to support the position",
                        score: 4
                    }
                ]
            },
            {
                name: "Development of Arguments",
                maxScore: 4,
                criteria: [
                    {
                        description: "Arguments are minimal, unclear, or not related to the position",
                        score: 1
                    },
                    {
                        description: "Some reasons are provided, but they may be weak or underdeveloped",
                        score: 2
                    },
                    {
                        description: "Arguments are relevant and mostly developed to support the position",
                        score: 3
                    },
                    {
                        description: "Arguments are well-developed, clear, and strongly support the position",
                        score: 4
                    }
                ]
            },
            {
                name: "Use of Evidence and Support",
                maxScore: 4,
                criteria: [
                    {
                        description: "Little to no evidence or examples are provided to support arguments",
                        score: 1
                    },
                    {
                        description: "Some evidence or examples are included, but support may be weak or unclear",
                        score: 2
                    },
                    {
                        description: "Relevant evidence or examples support most arguments",
                        score: 3
                    },
                    {
                        description: "Strong, relevant evidence or examples effectively support all arguments",
                        score: 4
                    }
                ]
            },
            {
                name: "Use of Language and Persuasive Tone",
                maxScore: 4,
                criteria: [
                    {
                        description: "Language is unclear, inappropriate, or does not attempt to persuade",
                        score: 1
                    },
                    {
                        description: "Language shows some attempt at persuasion, but tone is inconsistent or weak",
                        score: 2
                    },
                    {
                        description: "Language is appropriate and generally maintains a persuasive tone",
                        score: 3
                    },
                    {
                        description: "Language is purposeful and consistently maintains a strong persuasive tone",
                        score: 4
                    }
                ]
            },
            {
                name: "Conclusion",
                maxScore: 4,
                criteria: [
                    {
                        description: "Conclusion is missing or does not reinforce the position",
                        score: 1
                    },
                    {
                        description: "Conclusion is present but weak or loosely connected to the arguments",
                        score: 2
                    },
                    {
                        description: "Conclusion restates the position and summarizes key arguments",
                        score: 3
                    },
                    {
                        description: "Clear and effective conclusion that reinforces the position and arguments",
                        score: 4
                    }
                ]
            },
            {
                name: "Conventions",
                maxScore: 4,
                criteria: [
                    {
                        description: "Frequent errors in grammar, spelling, or punctuation interfere with understanding",
                        score: 1
                    },
                    {
                        description: "Some errors are present and occasionally affect clarity",
                        score: 2
                    },
                    {
                        description: "Minor errors are present but do not significantly affect understanding",
                        score: 3
                    },
                    {
                        description: "Grammar, spelling, and punctuation are mostly correct and enhance clarity",
                        score: 4
                    }
                ]
            }
        ]
    },
    {
        title: "Journal Entry",
        rubricData: [
            {
                name: "Response to the Prompt",
                maxScore: 4,
                criteria: [
                    {
                        description: "Response does not address the prompt or is extremely limited",
                        score: 1
                    },
                    {
                        description: "Response partially addresses the prompt, but ideas are unclear or incomplete",
                        score: 2
                    },
                    {
                        description: "Response clearly addresses the prompt with relevant ideas",
                        score: 3
                    },
                    {
                        description: "Response thoughtfully and fully addresses the prompt with clear ideas",
                        score: 4
                    }
                ]
            },
            {
                name: "Development of Ideas",
                maxScore: 4,
                criteria: [
                    {
                        description: "Ideas are minimal, repetitive, or not explained",
                        score: 1
                    },
                    {
                        description: "Some ideas are explained, but details are limited",
                        score: 2
                    },
                    {
                        description: "Ideas are explained with relevant details or examples",
                        score: 3
                    },
                    {
                        description: "Ideas are well-developed with thoughtful details or reflections",
                        score: 4
                    }
                ]
            },
            {
                name: "Voice and Reflection",
                maxScore: 4,
                criteria: [
                    {
                        description: "Little to no personal voice or reflection is evident",
                        score: 1
                    },
                    {
                        description: "Some personal voice or reflection is present, but it is limited",
                        score: 2
                    },
                    {
                        description: "Clear personal voice and reflection are evident",
                        score: 3
                    },
                    {
                        description: "Strong personal voice with meaningful reflection is evident",
                        score: 4
                    }
                ]
            },
            {
                name: "Focus and Effort",
                maxScore: 4,
                criteria: [
                    {
                        description: "Response shows little effort or focus on the task",
                        score: 1
                    },
                    {
                        description: "Some effort is shown, but focus may be inconsistent",
                        score: 2
                    },
                    {
                        description: "Consistent effort and focus on the prompt are evident",
                        score: 3
                    },
                    {
                        description: "Strong effort and clear focus are evident throughout the response",
                        score: 4
                    }
                ]
            },
            {
                name: "Conventions",
                maxScore: 4,
                criteria: [
                    {
                        description: "Frequent errors interfere with understanding",
                        score: 1
                    },
                    {
                        description: "Some errors are present and occasionally affect clarity",
                        score: 2
                    },
                    {
                        description: "Minor errors are present but meaning is clear",
                        score: 3
                    },
                    {
                        description: "Grammar, spelling, and punctuation are mostly correct",
                        score: 4
                    }
                ]
            }
        ]
    },
    {
        title: "Paragraph Writing",
        rubricData: [
            {
                maxScore: 4,
                name: "Topic Sentence",
                criteria: [
                    {
                        description: "Topic sentence is missing or does not relate to the paragraph",
                        score: 1,
                    },
                    {
                        description: "Topic sentence is present but unclear or weak",
                        score: 2
                    },
                    {
                        description: "Clear topic sentence that states the main idea",
                        score: 3
                    },
                    {
                        description: "Strong and clear topic sentence that effectively introduces the main idea",
                        score: 4
                    }
                ]
            },
            {
                maxScore: 4,
                name: "Supporting Details",
                criteria: [
                    {
                        description: "Details are missing, unclear, or unrelated to the topic",
                        score: 1
                    },
                    {
                        description: "Some supporting details are present but are limited or weak",
                        score: 2
                    },
                    {
                        description: "Relevant details support the topic sentence",
                        score: 3
                    },
                    {
                        description: "Specific and relevant details clearly support and explain the topic",
                        score: 4
                    }
                ]
            },
            {
                maxScore: 4,
                name: "Organization",
                criteria: [
                    {
                        description: "Ideas are disorganized or difficult to follow",
                        score: 1
                    },
                    {
                        description: "Some organization is present but ideas may be unclear or repetitive",
                        score: 2
                    },
                    {
                        description: "Ideas are organized and generally easy to follow",
                        score: 3
                    },
                    {
                        description: "Ideas are clearly organized and flow smoothly",
                        score: 4
                    }
                ]
            },
            {
                maxScore: 4,
                name: "Conventions",
                criteria: [
                    {
                        description: "Frequent errors interfere with understanding",
                        score: 1
                    },
                    {
                        description: "Some errors are present and may affect clarity",
                        score: 2
                    },
                    {
                        description: "Minor errors are present but do not affect understanding",
                        score: 3
                    },
                    {
                        description: "Grammar, spelling, and punctuation are mostly correct",
                        score: 4
                    }
                ]
            }
        ]
    },
    {
        title: "Short Constructed Response",
        rubricData: [
            {
                maxScore: 4,
                name: "Answer to the Question",
                criteria: [
                    {
                        description: "Does not answer the question or response is incorrect",
                        score: 1
                    },
                    {
                        description: "Partially answers the question or response is unclear",
                        score: 2
                    },
                    {
                        description: "Answers the question correctly",
                        score: 3
                    },
                    {
                        description: "Clearly and accurately answers the question",
                        score: 4
                    }
                ]
            },
            {
                maxScore: 4,
                name: "Use of Evidence",
                criteria: [
                    {
                        description: "No evidence is provided",
                        score: 1
                    },
                    {
                        description: "Evidence is weak, vague, or loosely connected",
                        score: 2
                    },
                    {
                        description: "Relevant evidence supports the response",
                        score: 3
                    },
                    {
                        description: "Specific and well-chosen evidence clearly supports the response",
                        score: 4
                    }
                ]
            },
            {
                maxScore: 4,
                name: "Explanation / Reasoning",
                criteria: [
                    {
                        description: "No explanation is provided",
                        score: 1
                    },
                    {
                        description: "Explanation is limited or unclear",
                        score: 2
                    },
                    {
                        description: "Explanation connects the evidence to the answer",
                        score: 3
                    },
                    {
                        description: "Clear and logical explanation that fully supports the answer",
                        score: 4
                    }
                ]
            },
            {
                maxScore: 4,
                name: "Clarity and Conventions",
                criteria: [
                    {
                        description: "Errors or lack of clarity interfere with understanding",
                        score: 1
                    },
                    {
                        description: "Some errors are present and affect clarity",
                        score: 2
                    },
                    {
                        description: "Minor errors are present but meaning is clear",
                        score: 3
                    },
                    {
                        description: "Writing is clear and mostly free of errors",
                        score: 4
                    }
                ]
            }
        ]
    }



];
